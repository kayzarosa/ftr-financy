import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET é obrigatória"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Variáveis de ambiente inválidas:",
    z.flattenError(parsed.error),
  );
  throw new Error("Variáveis de ambiente inválidas. Confira o .env");
}

export const env = parsed.data;