import type { SignedUpload } from "./types";

// Uploads one chunk to a presigned URL, retrying with exponential backoff
// (1s, 2s, 4s, 8s, capped at 10s) before giving up. Each chunk is retried
// independently — one bad chunk doesn't block the others queued behind it.
export function createChunkUploader(params: {
  getUploadUrl: (chunkIndex: number) => Promise<SignedUpload>;
  maxRetries?: number;
}) {
  const { getUploadUrl, maxRetries = 4 } = params;

  return async function uploadChunk(chunkIndex: number, blob: Blob): Promise<void> {
    for (let attempt = 0; ; attempt++) {
      try {
        const signed = await getUploadUrl(chunkIndex);
        const res =
          signed.method === "PUT"
            ? await fetch(signed.url, { method: "PUT", headers: signed.headers, body: blob })
            : await fetch(signed.url, { method: "POST", body: toFormData(signed.fields, blob) });

        if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
        return;
      } catch (err) {
        if (attempt >= maxRetries) throw err;
        const delayMs = Math.min(1000 * 2 ** attempt, 10_000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  };
}

function toFormData(fields: Record<string, string>, blob: Blob): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  form.append("file", blob);
  return form;
}
