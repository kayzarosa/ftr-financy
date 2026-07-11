import { CreateCategoryUseCase } from "@/use-cases/category/create-category.js";
import { PrismaCategoryRepository } from "../database/prisma/repositories/prisma-category-repository.js";

export function makeCreateCategoryUseCase(): CreateCategoryUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new CreateCategoryUseCase(categoryRepository);
}
