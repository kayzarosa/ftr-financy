import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client.js";

const DATABASE_URL = process.env["DATABASE_URL"];

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL não foi definida no .env");
}

const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
