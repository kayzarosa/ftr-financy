import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { ListCategoriesUseCase } from "@/use-cases/category/list-category.js";

export function makeListCategoriesUseCase(): ListCategoriesUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new ListCategoriesUseCase(categoryRepository);
}
