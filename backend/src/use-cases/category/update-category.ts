import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { CategoryAlreadyExistsError } from "../errors/category-already-exists-error.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";

type UpdateCategoryRequest = {
  id: string;
  name?: string | undefined;
  color?: string | null | undefined;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  userId: string;
};

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({ id, userId, color, name, description, icon }: UpdateCategoryRequest) {
    const categoryExists = await this.categoryRepository.findById(id);

    if (!categoryExists || categoryExists.userId !== userId) {
      throw new CategoryNotFoundError();
    }

    if (name) {
      const nameCategoryExists = await this.categoryRepository.findByNameAndUserId(userId, name);

      if (nameCategoryExists && nameCategoryExists.id !== id && nameCategoryExists.name === name) {
        throw new CategoryAlreadyExistsError();
      }
    }

    const category = await this.categoryRepository.update(id, {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
    });

    return { category };
  }
}
