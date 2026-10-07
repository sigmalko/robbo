import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/test/**/*.spec.ts"],
    environment: "node",
    // Campaign simulations cover all 112 imported maps and can exceed Vitest's
    // short default on GitHub-hosted runners.
    testTimeout: 30_000
  }
});
