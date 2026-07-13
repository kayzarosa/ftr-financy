import { PrismaTransactionRepository } from "@/infra/database/prisma/repositories/prisma-transaction-repository.js";
import { DeleteTransactionUseCase } from "@/use-cases/transaction/delete-transaction.js";

export function makeDeleteTransactionUseCase(): DeleteTransactionUseCase {
  const transactionRepository = new PrismaTransactionRepository();

  return new DeleteTransactionUseCase(transactionRepository);
}
