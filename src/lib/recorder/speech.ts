export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

export interface SpeechController {
  start: () => void;
  stop: () => void;
}

// Wraps the browser's built-in SpeechRecognition for a running live
// transcript. Chrome/Edge only — there's no Safari implementation, so
// isSpeechRecognitionSupported() must be checked before calling this.
//
// Note: this captures from the mic independently of our MediaRecorder-based
// audio recording — the browser runs its own separate internal audio
// pipeline for speech recognition. The two aren't related; this is only
// for the on-screen live transcript, not the saved recording.
export function createSpeechController(params: {
  onFinalText: (text: string) => void;
  onInterimText: (text: string) => void;
}): SpeechController | null {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionCtor = (window.SpeechRecognition ??
    window.webkitSpeechRecognition) as typeof SpeechRecognition;
  const recognition = new SpeechRecognitionCtor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let shouldBeListening = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? "";
      if (result.isFinal) {
        params.onFinalText(text.trim());
      } else {
        interim += text;
      }
    }
    params.onInterimText(interim.trim());
  };

  recognition.onerror = (event) => {
    // "no-speech" and "aborted" are routine (a pause, or our own restart) —
    // onend below retries those. Anything else, stop trying to recover.
    if (event.error !== "no-speech" && event.error !== "aborted") {
      shouldBeListening = false;
    }
  };

  recognition.onend = () => {
    // The browser ends a session on its own after a period of silence even
    // with continuous=true — restart so the transcript keeps running for
    // the whole recording, not just until the first pause.
    if (shouldBeListening) {
      try {
        recognition.start();
      } catch {
        // Already starting — ignore.
      }
    }
  };

  return {
    start: () => {
      shouldBeListening = true;
      try {
        recognition.start();
      } catch {
        // Already running — ignore.
      }
    },
    stop: () => {
      shouldBeListening = false;
      recognition.stop();
    },
  };
}
