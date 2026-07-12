import { UpdateCategoryUseCase } from "@/use-cases/category/update-category.js";
import { PrismaCategoryRepository } from "../database/prisma/repositories/prisma-category-repository.js";

export function makeUpdateCategoryUseCase(): UpdateCategoryUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new UpdateCategoryUseCase(categoryRepository);
}
