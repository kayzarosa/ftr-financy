import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { PrismaTransactionRepository } from "@/infra/database/prisma/repositories/prisma-transaction-repository.js";
import { UpdateTransactionUseCase } from "@/use-cases/transaction/update-transaction.js";

export function makeUpdateTransactionUseCase(): UpdateTransactionUseCase {
  const transactionRepository = new PrismaTransactionRepository();
  const categoryRepository = new PrismaCategoryRepository();

  return new UpdateTransactionUseCase(
    transactionRepository,
    categoryRepository,
  );
}