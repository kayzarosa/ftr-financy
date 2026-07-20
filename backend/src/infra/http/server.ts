import "dotenv/config";

import { prisma } from "@/infra/database/prisma/prisma.js";
import { buildApp } from "@/infra/http/build-app.js";

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Banco de dados conectado");
  } catch (error) {
    console.error("❌ Não foi possível conectar ao banco de dados:", error);
    process.exit(1);
  }

  const app = await buildApp();

  app.listen({ port: 3333, host: "0.0.0.0" }, () => {
    console.log("🚀 Server ready at http://localhost:3333/graphql");
  });
}

main();
