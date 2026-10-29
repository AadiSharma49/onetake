import json
import os
import traceback

from dotenv import load_dotenv
from redis import Redis

from jobs import transcribe_recording

load_dotenv()

# Plain JSON-over-Redis-list, not RQ: the producer is the Next.js app (LPUSH
# a JSON string), and RQ's job format is Python-pickle-specific — it can't
# be enqueued from Node. BRPOP here pairs with LPUSH on the Next.js side,
# which makes this a FIFO queue (push left, pop right).
QUEUE_KEY = "queue:transcription"


def main() -> None:
    redis_conn = Redis.from_url(os.environ["REDIS_URL"])
    print(f"Worker listening on '{QUEUE_KEY}'...")
    while True:
        _, raw_job = redis_conn.brpop(QUEUE_KEY)
        try:
            job = json.loads(raw_job)
            transcribe_recording(job["recordingId"])
        except Exception:
            traceback.print_exc()


if __name__ == "__main__":
    main()
