import { redis } from "./redis";

// Same key the Python worker's BRPOP listens on — see worker/worker.py.
// LPUSH here + BRPOP there makes this a FIFO queue.
const QUEUE_KEY = "queue:transcription";

export async function enqueueTranscription(recordingId: string): Promise<void> {
  await redis.lpush(QUEUE_KEY, JSON.stringify({ recordingId }));
}
