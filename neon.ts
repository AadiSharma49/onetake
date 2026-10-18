import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Private — recorder chunks are user content, accessed only via presigned
  // URLs issued after an ownership check, never read anonymously.
  buckets: {
    recordings: {},
  },
});
