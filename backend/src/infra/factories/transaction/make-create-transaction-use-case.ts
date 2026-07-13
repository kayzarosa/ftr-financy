import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { PrismaTransactionRepository } from "@/infra/database/prisma/repositories/prisma-transaction-repository.js";
import { PrismaUserRepository } from "@/infra/database/prisma/repositories/prisma-user-repository.js";
import { CreateTransactionUseCase } from "@/use-cases/transaction/create-transaction.js";

export function makeCreateTransactionUseCase(): CreateTransactionUseCase {
  const transactionRepository = new PrismaTransactionRepository();
  const userRepository = new PrismaUserRepository();
  const categoryRepository = new PrismaCategoryRepository();

  return new CreateTransactionUseCase(transactionRepository, userRepository, categoryRepository);
}
