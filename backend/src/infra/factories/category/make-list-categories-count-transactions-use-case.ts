import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { ListCategoriesCountTransactionsUseCase } from "@/use-cases/category/list-category-count-transactions.js";

export function makeListCategoriesCountTransactionsUseCase(): ListCategoriesCountTransactionsUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new ListCategoriesCountTransactionsUseCase(categoryRepository);
}
