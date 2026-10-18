"use client";

import { useEffect, useRef } from "react";

interface DevicePickerProps {
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  selectedCameraId: string | null;
  selectedMicId: string | null;
  onSelectCamera: (id: string) => void;
  onSelectMic: (id: string) => void;
  cameraOff: boolean;
  onToggleCameraOff: (off: boolean) => void;
  previewStream: MediaStream | null;
  micLevel: number;
}

export function DevicePicker({
  cameras,
  mics,
  selectedCameraId,
  selectedMicId,
  onSelectCamera,
  onSelectMic,
  cameraOff,
  onToggleCameraOff,
  previewStream,
  micLevel,
}: DevicePickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = previewStream;
  }, [previewStream]);

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-black/[.08] bg-black dark:border-white/[.145]">
        {cameraOff ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Camera off
          </div>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Camera</span>
          <select
            value={selectedCameraId ?? ""}
            onChange={(e) => onSelectCamera(e.target.value)}
            disabled={cameraOff}
            className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-white/[.145]"
          >
            {cameras.length === 0 && <option value="">No camera found</option>}
            {cameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || "Camera"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Microphone</span>
          <select
            value={selectedMicId ?? ""}
            onChange={(e) => onSelectMic(e.target.value)}
            className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          >
            {mics.length === 0 && <option value="">No microphone found</option>}
            {mics.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || "Microphone"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={cameraOff}
            onChange={(e) => onToggleCameraOff(e.target.checked)}
          />
          Camera off
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Mic level</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[.08] dark:bg-white/[.145]">
          <div
            className="h-full bg-accent transition-[width] duration-75"
            style={{ width: `${Math.min(micLevel * 220, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
