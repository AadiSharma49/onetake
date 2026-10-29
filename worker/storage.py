import os
import subprocess
import tempfile
from pathlib import Path

import boto3

BUCKET = "recordings"


def _s3_client():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["AWS_ENDPOINT_URL_S3"],
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name=os.environ["AWS_REGION"],
        # Neon requires path-style addressing, same as the Next.js side.
        config=boto3.session.Config(s3={"addressing_style": "path"}),
    )


def _list_chunk_keys(storage_key_prefix: str) -> list[str]:
    s3 = _s3_client()
    keys: list[str] = []
    continuation_token = None
    while True:
        kwargs = {"Bucket": BUCKET, "Prefix": storage_key_prefix}
        if continuation_token:
            kwargs["ContinuationToken"] = continuation_token
        response = s3.list_objects_v2(**kwargs)
        keys.extend(obj["Key"] for obj in response.get("Contents", []))
        if not response.get("IsTruncated"):
            break
        continuation_token = response["NextContinuationToken"]
    # Chunk filenames are zero-padded (00000.part, 00001.part, ...), so a
    # plain sort already puts them back in recording order.
    return sorted(keys)


def download_and_concatenate_audio(storage_key_prefix: str, work_dir: Path) -> Path:
    """Downloads every chunk under the prefix, concatenates them (raw
    MediaRecorder timeslices from one continuous session reassemble cleanly
    this way), and transcodes to 16kHz mono FLAC — small, lossless, and
    exactly what Whisper-family models want as input.
    """
    keys = _list_chunk_keys(storage_key_prefix)
    if not keys:
        raise RuntimeError(f"No chunks found under {storage_key_prefix!r}")

    s3 = _s3_client()
    concatenated_path = work_dir / "concatenated.bin"
    with open(concatenated_path, "wb") as out:
        for key in keys:
            with tempfile.NamedTemporaryFile(dir=work_dir, delete=False) as chunk_file:
                s3.download_fileobj(BUCKET, key, chunk_file)
                chunk_path = Path(chunk_file.name)
            out.write(chunk_path.read_bytes())
            chunk_path.unlink()

    output_path = work_dir / "audio.flac"
    # +genpts regenerates timestamps ffmpeg can't trust from a raw
    # concatenation; +igndts ignores decode timestamps that don't line up
    # at the chunk boundaries rather than erroring out on them.
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-fflags",
            "+genpts+igndts",
            "-i",
            str(concatenated_path),
            "-ar",
            "16000",
            "-ac",
            "1",
            str(output_path),
        ],
        check=True,
        capture_output=True,
    )
    return output_path
