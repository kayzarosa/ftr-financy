import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { UpdateCategoryUseCase } from "@/use-cases/category/update-category.js";

export function makeUpdateCategoryUseCase(): UpdateCategoryUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new UpdateCategoryUseCase(categoryRepository);
}
