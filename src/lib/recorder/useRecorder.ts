"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCameraStream,
  getMicStream,
  getScreenStream,
  isScreenRecordingSupported,
  listDevices,
  pickAudioMimeType,
  pickVideoMimeType,
  stopStream,
} from "./media";
import { createChunkUploader } from "./upload-queue";
import type { RecorderPhase, TrackKind } from "./types";

const CHUNK_TIMESLICE_MS = 5000;
const COUNTDOWN_SECONDS = 3;

// One of these per active track (screen always, camera unless turned off, mic always).
interface TrackController {
  kind: TrackKind;
  stream: MediaStream;
  recorder: MediaRecorder;
  recordingId: string;
  nextChunkIndex: number;
  pendingUploads: Promise<void>[];
  failed: boolean;
}

async function createRecordingRow(
  projectId: string,
  kind: TrackKind,
  mimeType: string
): Promise<{ recordingId: string }> {
  const res = await fetch(`/api/projects/${projectId}/recordings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, mimeType, startOffsetMs: 0 }),
  });
  if (!res.ok) throw new Error(`Could not create ${kind} recording.`);
  return res.json();
}

function friendlyErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError") {
      return "Permission was denied. Allow camera/mic/screen access and try again.";
    }
    if (err.name === "NotFoundError") {
      return "No matching camera or microphone was found.";
    }
  }
  return err instanceof Error ? err.message : "Something went wrong starting the recorder.";
}

export function useRecorder(projectId: string) {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedMicId, setSelectedMicId] = useState<string | null>(null);
  const [cameraOff, setCameraOff] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const tracksRef = useRef<TrackController[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const audioAnalyserRef = useRef<{ ctx: AudioContext; raf: number } | null>(null);
  const uploadingCountRef = useRef(0);

  // --- Pre-record: acquire camera + mic for preview/meter, list devices ---
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!isScreenRecordingSupported()) {
        setError("Screen recording isn't supported in this browser (common on mobile).");
        setPhase("error");
        return;
      }
      setPhase("requesting-devices");
      try {
        // Checked after EVERY acquisition, not just once at the end. In dev,
        // React Strict Mode mounts this effect, cleans it up, then mounts it
        // again — the stale first run must stop before it ever reaches
        // getCameraStream(), or it races the real run for the same
        // (often exclusive-lock) camera device. Losing that race doesn't
        // throw on most drivers — it just delivers a track with no frames,
        // which is why the symptom was a silent black preview, not an error.
        const mic = await getMicStream();
        if (cancelled) {
          stopStream(mic);
          return;
        }

        const cam = cameraOff ? null : await getCameraStream();
        if (cancelled) {
          stopStream(mic);
          stopStream(cam);
          return;
        }

        const combined = new MediaStream([
          ...(cam?.getVideoTracks() ?? []),
          ...mic.getAudioTracks(),
        ]);
        setPreviewStream(combined);
        startMicMeter(mic);

        const { cameras: cams, mics: micList } = await listDevices();
        if (cancelled) return;
        setCameras(cams);
        setMics(micList);
        setPhase("idle");
      } catch (err) {
        if (cancelled) return;
        setError(friendlyErrorMessage(err));
        setPhase("error");
      }
    }

    setup();
    return () => {
      cancelled = true;
      stopStream(previewStream);
      stopMicMeter();
    };
    // Re-run only when the camera-off toggle changes — device switching is
    // handled by its own effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOff]);

  function startMicMeter(micStream: MediaStream) {
    stopMicMeter();
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(micStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      analyser.getByteTimeDomainData(data);
      // RMS of the centered waveform, 0..1.
      let sumSquares = 0;
      for (const value of data) {
        const centered = (value - 128) / 128;
        sumSquares += centered * centered;
      }
      setMicLevel(Math.sqrt(sumSquares / data.length));
      const raf = requestAnimationFrame(tick);
      if (audioAnalyserRef.current) audioAnalyserRef.current.raf = raf;
    }
    const raf = requestAnimationFrame(tick);
    audioAnalyserRef.current = { ctx, raf };
  }

  function stopMicMeter() {
    if (audioAnalyserRef.current) {
      cancelAnimationFrame(audioAnalyserRef.current.raf);
      audioAnalyserRef.current.ctx.close();
      audioAnalyserRef.current = null;
    }
    setMicLevel(0);
  }

  // --- beforeunload guard while recording or still uploading ---
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (phase === "recording" || phase === "stopping" || uploadingCountRef.current > 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase]);

  const stop = useCallback(async () => {
    if (phase !== "recording") return;
    setPhase("stopping");
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

    const finalDurationMs = Date.now() - startedAtRef.current;

    // MediaRecorder.stop() fires a final ondataavailable before onstop —
    // wait for onstop so that last chunk is queued before we flush uploads.
    await Promise.all(
      tracksRef.current.map(
        (track) =>
          new Promise<void>((resolve) => {
            track.recorder.addEventListener("stop", () => resolve(), { once: true });
            track.recorder.stop();
          })
      )
    );

    for (const track of tracksRef.current) {
      try {
        await Promise.all(track.pendingUploads);
        await fetch(`/api/projects/${projectId}/recordings/${track.recordingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "READY", durationMs: finalDurationMs }),
        });
      } catch {
        await fetch(`/api/projects/${projectId}/recordings/${track.recordingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "FAILED" }),
        }).catch(() => {});
      }
    }

    stopStream(screenStreamRef.current);
    for (const track of tracksRef.current) stopStream(track.stream);
    tracksRef.current = [];
    screenStreamRef.current = null;

    setPhase("stopped");
  }, [phase, projectId]);

  const stopRef = useRef(stop);
  stopRef.current = stop;

  const attachTrack = useCallback((kind: TrackKind, stream: MediaStream, mimeType: string, recordingId: string) => {
    const recorder = new MediaRecorder(stream, { mimeType });
    const controller: TrackController = {
      kind,
      stream,
      recorder,
      recordingId,
      nextChunkIndex: 0,
      pendingUploads: [],
      failed: false,
    };

    const uploadChunk = createChunkUploader({
      getUploadUrl: async (chunkIndex) => {
        const res = await fetch(
          `/api/projects/${projectId}/recordings/${recordingId}/chunk-url`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chunkIndex }),
          }
        );
        if (!res.ok) throw new Error("Could not get an upload URL.");
        return res.json();
      },
    });

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size === 0) return;
      const chunkIndex = controller.nextChunkIndex++;
      uploadingCountRef.current++;
      const upload = uploadChunk(chunkIndex, event.data)
        .catch((err) => {
          controller.failed = true;
          setError(`A ${kind.toLowerCase()} chunk failed to upload: ${friendlyErrorMessage(err)}`);
        })
        .finally(() => {
          uploadingCountRef.current--;
        });
      controller.pendingUploads.push(upload);
    });

    tracksRef.current.push(controller);
    return recorder;
  }, [projectId]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const screen = await getScreenStream();
      screenStreamRef.current = screen;

      // If the user stops sharing from the browser's own "Stop sharing"
      // bar, treat it the same as clicking our Stop button.
      screen.getVideoTracks()[0]?.addEventListener("ended", () => stopRef.current());

      for (let count = COUNTDOWN_SECONDS; count > 0; count--) {
        setCountdownValue(count);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdownValue(null);

      const camera = cameraOff ? null : await getCameraStream(selectedCameraId ?? undefined);
      const mic = await getMicStream(selectedMicId ?? undefined);
      stopMicMeter();

      const videoMimeType = pickVideoMimeType();
      const audioMimeType = pickAudioMimeType();

      const { recordingId: screenId } = await createRecordingRow(projectId, "SCREEN", videoMimeType);
      attachTrack("SCREEN", screen, videoMimeType, screenId);

      if (camera) {
        const { recordingId: cameraId } = await createRecordingRow(projectId, "CAMERA", videoMimeType);
        attachTrack("CAMERA", camera, videoMimeType, cameraId);
      }

      const { recordingId: micId } = await createRecordingRow(projectId, "MIC", audioMimeType);
      attachTrack("MIC", mic, audioMimeType, micId);

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      elapsedTimerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 250);

      for (const track of tracksRef.current) {
        track.recorder.start(CHUNK_TIMESLICE_MS);
      }
      setPhase("recording");
    } catch (err) {
      stopStream(screenStreamRef.current);
      setError(friendlyErrorMessage(err));
      setPhase("error");
    }
  }, [attachTrack, cameraOff, projectId, selectedCameraId, selectedMicId]);

  // Release everything on unmount, however we got there.
  useEffect(() => {
    return () => {
      stopStream(previewStream);
      stopStream(screenStreamRef.current);
      for (const track of tracksRef.current) stopStream(track.stream);
      stopMicMeter();
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    phase,
    error,
    cameras,
    mics,
    selectedCameraId,
    setSelectedCameraId,
    selectedMicId,
    setSelectedMicId,
    cameraOff,
    setCameraOff,
    previewStream,
    micLevel,
    countdownValue,
    elapsedMs,
    start,
    stop,
  };
}
