import { DeleteCategoryUseCase } from "@/use-cases/category/delete-category.js";
import { PrismaCategoryRepository } from "../database/prisma/repositories/prisma-category-repository.js";

export function makeDeleteCategoryUseCase(): DeleteCategoryUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new DeleteCategoryUseCase(categoryRepository);
}
