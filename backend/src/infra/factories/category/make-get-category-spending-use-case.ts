import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { GetCategorySpendingUseCase } from "@/use-cases/category/get-category-spending.js";

export function makeGetCategorySpendingUseCase(): GetCategorySpendingUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new GetCategorySpendingUseCase(categoryRepository);
}
