import { ListCategoriesUseCase } from "@/use-cases/category/list-category.js";
import { PrismaCategoryRepository } from "../database/prisma/repositories/prisma-category-repository.js";

export function makeListCategoriesUseCase(): ListCategoriesUseCase {
  const categoryRepository = new PrismaCategoryRepository();

  return new ListCategoriesUseCase(categoryRepository);
}
