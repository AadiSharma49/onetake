"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSpeechController, isSpeechRecognitionSupported, type SpeechController } from "./speech";

// Separate from useRecorder on purpose: this only drives the on-screen live
// transcript panel, not the saved recording. The Recorder component starts
// and stops it in step with the recorder's own phase.
export function useLiveTranscript() {
  const [lines, setLines] = useState<string[]>([]);
  const [interimText, setInterimText] = useState("");
  const controllerRef = useRef<SpeechController | null>(null);

  const start = useCallback(() => {
    setLines([]);
    setInterimText("");
    controllerRef.current = createSpeechController({
      onFinalText: (text) => {
        if (!text) return;
        setLines((prev) => [...prev, text]);
        setInterimText("");
      },
      onInterimText: setInterimText,
    });
    controllerRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setInterimText("");
  }, []);

  // Don't rely on the caller remembering to stop this — release the mic
  // pipeline if the component unmounts while still "recording".
  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  return {
    isSupported: isSpeechRecognitionSupported(),
    lines,
    interimText,
    start,
    stop,
  };
}
