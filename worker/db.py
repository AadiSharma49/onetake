import os
import psycopg

# Raw SQL, not an ORM — the worker only ever updates a couple of columns on
# a row the Next.js/Prisma side already owns the schema for.
def get_connection() -> psycopg.Connection:
    url = os.environ["DATABASE_URL_UNPOOLED"]
    return psycopg.connect(url)


def fetch_recording(recording_id: str) -> dict | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, "storageKeyPrefix", "mimeType"
                FROM "Recording"
                WHERE id = %s
                """,
                (recording_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None
            return {"id": row[0], "storage_key_prefix": row[1], "mime_type": row[2]}


def set_transcript_status(recording_id: str, status: str) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE "Recording"
                SET "transcriptStatus" = %s, "updatedAt" = now()
                WHERE id = %s
                """,
                (status, recording_id),
            )
        conn.commit()


def save_transcript(recording_id: str, transcript_json: dict) -> None:
    import json

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE "Recording"
                SET "transcriptStatus" = 'READY',
                    "transcriptJson" = %s,
                    "updatedAt" = now()
                WHERE id = %s
                """,
                (json.dumps(transcript_json), recording_id),
            )
        conn.commit()
