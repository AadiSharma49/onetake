import tempfile
from pathlib import Path

from db import fetch_recording, save_transcript, set_transcript_status
from storage import download_and_concatenate_audio
from transcribe import transcribe_with_word_timestamps


def transcribe_recording(recording_id: str) -> None:
    """RQ job entrypoint. Enqueued by the Next.js app when a MIC recording
    finishes uploading. Not called directly — see worker.py.
    """
    recording = fetch_recording(recording_id)
    if recording is None:
        return

    set_transcript_status(recording_id, "PROCESSING")
    try:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = download_and_concatenate_audio(
                recording["storage_key_prefix"], Path(tmp)
            )
            transcript = transcribe_with_word_timestamps(audio_path)
        save_transcript(recording_id, transcript)
    except Exception:
        set_transcript_status(recording_id, "FAILED")
        raise
