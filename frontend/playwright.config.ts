import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const backendDir = path.resolve(import.meta.dirname, "../backend");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        "rm -f e2e.db e2e.db-journal e2e.db-wal e2e.db-shm && pnpm exec prisma db push && pnpm exec tsx src/infra/http/server.ts",
      cwd: backendDir,
      env: { DATABASE_URL: "file:./e2e.db" },
      url: "http://localhost:3333/graphql",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm dev --port 5173 --strictPort",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
