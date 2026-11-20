export async function readResponseBytes(response: Response, limit: number): Promise<Buffer | undefined> {
  if (!response.body) return undefined;
  if (!response.ok || Number(response.headers.get("content-length")) > limit) {
    void response.body.cancel().catch(() => {});
    return undefined;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return byteLength ? Buffer.concat(chunks, byteLength) : undefined;
      byteLength += value.byteLength;
      if (byteLength > limit) {
        void reader.cancel().catch(() => {});
        return undefined;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}
