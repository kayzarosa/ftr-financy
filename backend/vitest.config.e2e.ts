import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["**/*.e2e.spec.ts"],
    globalSetup: ["./test/e2e/global-setup.ts"],
    setupFiles: ["./test/e2e/setup.ts"],
    env: {
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret",
    },
    fileParallelism: false,
  },
});
