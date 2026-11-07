import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "content-collections": fileURLToPath(new URL("./.content-collections/generated", import.meta.url)),
    },
  },
  test: { globals: true, globalSetup: ["tests/setup/content-collections.ts"], include: ["tests/**/*.test.{ts,tsx}"] },
});
