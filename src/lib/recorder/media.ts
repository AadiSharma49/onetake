// Preference order matters: vp9 compresses better than vp8, and both beat
// Safari's mp4-only support. isTypeSupported is the only reliable way to
// know what a given browser will actually accept.
const VIDEO_CANDIDATES = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/mp4"];
const AUDIO_CANDIDATES = ["audio/webm;codecs=opus", "audio/mp4"];

export function pickVideoMimeType(): string {
  const type = VIDEO_CANDIDATES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  if (!type) throw new Error("No supported video recording format in this browser.");
  return type;
}

export function pickAudioMimeType(): string {
  const type = AUDIO_CANDIDATES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  if (!type) throw new Error("No supported audio recording format in this browser.");
  return type;
}

export function isScreenRecordingSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia;
}

export async function getScreenStream(): Promise<MediaStream> {
  if (!isScreenRecordingSupported()) {
    throw new Error("Screen recording isn't supported in this browser.");
  }
  // audio: true requests tab/system audio where the OS picker offers it —
  // the user can decline it in the picker without recording failing.
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
}

export async function getCameraStream(deviceId?: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: deviceId ? { deviceId: { exact: deviceId } } : true,
  });
}

export async function getMicStream(deviceId?: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
  });
}

export async function listDevices(): Promise<{
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
}> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: devices.filter((d) => d.kind === "videoinput"),
    mics: devices.filter((d) => d.kind === "audioinput"),
  };
}

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}
