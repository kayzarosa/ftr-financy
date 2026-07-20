import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const TEST_DB_FILE = "test.db";
const TEST_DATABASE_URL = "file:./test.db";

function cleanup() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    rmSync(`${TEST_DB_FILE}${suffix}`, { force: true });
  }
}

export async function setup() {
  cleanup();

  execSync("pnpm exec prisma db push", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}

export async function teardown() {
  cleanup();
}
