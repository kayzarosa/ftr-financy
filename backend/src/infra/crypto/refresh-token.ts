import { randomBytes } from "node:crypto";

export function generateRefreshToken(): string {
  return randomBytes(64).toString("hex");
}
