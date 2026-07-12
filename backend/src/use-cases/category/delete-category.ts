import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";

type DeleteCategoryRequest = {
  id: string;
  userId: string;
};

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({ id, userId }: DeleteCategoryRequest) {
    const category = await this.categoryRepository.findById(id);

    if (!category || category.userId !== userId) {
      throw new CategoryNotFoundError();
    }

    await this.categoryRepository.delete(id);
  }
}
