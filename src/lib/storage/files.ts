import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

export const RECORDINGS_BUCKET = "recordings";

// Credentials/endpoint/region come from the AWS_* env vars neon deploy
// injected into .env.local — nothing to pass explicitly beyond the bucket.
export const recordingsFiles = new Files({
  adapter: neon({ bucket: RECORDINGS_BUCKET }),
});

// Per-chunk cap: a 5s timeslice at a generous screen-capture bitrate is
// nowhere near this: safety ceiling against a runaway client, not a tight budget.
export const MAX_CHUNK_BYTES = 50 * 1024 * 1024;
