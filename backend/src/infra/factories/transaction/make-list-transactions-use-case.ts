import { PrismaTransactionRepository } from "@/infra/database/prisma/repositories/prisma-transaction-repository.js";
import { ListTransactionUseCase } from "@/use-cases/transaction/list-transaction.js";

export function makeListTransactionUseCase(): ListTransactionUseCase {
  const transactionRepository = new PrismaTransactionRepository();

  return new ListTransactionUseCase(transactionRepository);
}
