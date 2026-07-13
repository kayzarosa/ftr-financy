import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { CreateCategoryUseCase } from "@/use-cases/category/create-category.js";

export function makeCreateCategoryUseCase(): CreateCategoryUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new CreateCategoryUseCase(categoryRepository);
}
