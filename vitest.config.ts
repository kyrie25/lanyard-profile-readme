import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": `${rootDir}src`,
      "#": rootDir,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
