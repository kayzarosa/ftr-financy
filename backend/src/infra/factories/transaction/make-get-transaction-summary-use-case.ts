import { PrismaTransactionRepository } from "@/infra/database/prisma/repositories/prisma-transaction-repository.js";
import { GetTransactionSummaryUseCase } from "@/use-cases/transaction/get-transaction-summary.js";

export function makeGetTransactionSummaryUseCase(): GetTransactionSummaryUseCase {
  const transactionRepository = new PrismaTransactionRepository();

  return new GetTransactionSummaryUseCase(transactionRepository);
}
