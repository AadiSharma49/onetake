import os
from pathlib import Path

from groq import Groq


def transcribe_with_word_timestamps(audio_path: Path) -> dict:
    client = Groq(api_key=os.environ["GROQ_API_KEY"])
    with open(audio_path, "rb") as f:
        response = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )
    # response is a Pydantic model; store the plain dict shape in Postgres.
    return response.model_dump()
