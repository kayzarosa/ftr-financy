import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { DeleteCategoryUseCase } from "@/use-cases/category/delete-category.js";

export function makeDeleteCategoryUseCase(): DeleteCategoryUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new DeleteCategoryUseCase(categoryRepository);
}
