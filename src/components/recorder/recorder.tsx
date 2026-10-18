"use client";

import { useEffect, useRef } from "react";
import { useRecorder } from "@/lib/recorder/useRecorder";
import { useLiveTranscript } from "@/lib/recorder/useLiveTranscript";
import { usePointsMatcher, type TrackedPoint } from "@/lib/recorder/usePointsMatcher";
import { DevicePicker } from "./device-picker";
import { CountdownOverlay, RecordingControls } from "./recording-controls";
import { LiveTranscript } from "./live-transcript";
import { PointsTracker } from "./points-tracker";

export function Recorder({
  projectId,
  timeLimitSeconds,
  initialPoints,
}: {
  projectId: string;
  timeLimitSeconds: number;
  initialPoints: TrackedPoint[];
}) {
  const recorder = useRecorder(projectId);
  const transcript = useLiveTranscript();
  const matcher = usePointsMatcher(projectId, initialPoints);

  // Live transcript tracks the recorder's phase rather than being started
  // from the same click handler — phase is the one source of truth for
  // "are we actually recording right now."
  const wasRecordingRef = useRef(false);
  useEffect(() => {
    const isRecording = recorder.phase === "recording";
    if (isRecording && !wasRecordingRef.current) {
      transcript.start();
    } else if (!isRecording && wasRecordingRef.current) {
      transcript.stop();
    }
    wasRecordingRef.current = isRecording;
    // transcript.start/stop are stable (useCallback with no deps) — only
    // recorder.phase should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.phase]);

  // Feed every new final transcript line to the points matcher (which
  // debounces its own Gemini calls internally).
  useEffect(() => {
    if (transcript.lines.length === 0) return;
    matcher.notifyTranscript(transcript.lines.join(" "));
    // matcher.notifyTranscript is stable per projectId — only new lines
    // should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript.lines]);

  if (recorder.phase === "error") {
    return (
      <p className="rounded-2xl border border-accent/40 bg-accent/5 p-4 text-sm text-accent">
        {recorder.error}
      </p>
    );
  }

  if (recorder.phase === "requesting-devices") {
    return <p className="text-sm text-zinc-500">Asking for camera and microphone access…</p>;
  }

  if (recorder.phase === "countdown" || recorder.countdownValue !== null) {
    return <CountdownOverlay value={recorder.countdownValue ?? 0} />;
  }

  if (recorder.phase === "recording") {
    return (
      <div className="flex flex-col gap-4">
        {recorder.error && (
          <p className="rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm text-accent">
            {recorder.error}
          </p>
        )}
        <RecordingControls elapsedMs={recorder.elapsedMs} onStop={recorder.stop} />
        <PointsTracker
          points={matcher.points}
          elapsedMs={recorder.elapsedMs}
          timeLimitSeconds={timeLimitSeconds}
        />
        <LiveTranscript
          lines={transcript.lines}
          interimText={transcript.interimText}
          isSupported={transcript.isSupported}
        />
      </div>
    );
  }

  if (recorder.phase === "stopping") {
    return <p className="text-sm text-zinc-500">Finishing upload…</p>;
  }

  if (recorder.phase === "stopped") {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Recording saved.</p>;
  }

  // idle
  return (
    <div className="flex flex-col gap-6">
      <DevicePicker
        cameras={recorder.cameras}
        mics={recorder.mics}
        selectedCameraId={recorder.selectedCameraId}
        selectedMicId={recorder.selectedMicId}
        onSelectCamera={recorder.setSelectedCameraId}
        onSelectMic={recorder.setSelectedMicId}
        cameraOff={recorder.cameraOff}
        onToggleCameraOff={recorder.setCameraOff}
        previewStream={recorder.previewStream}
        micLevel={recorder.micLevel}
      />
      {initialPoints.length > 0 && (
        <div className="rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Points to cover
          </span>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {initialPoints.map((point) => (
              <li key={point.id}>• {point.text}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={recorder.start}
        className="flex h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
      >
        Start recording
      </button>
    </div>
  );
}
