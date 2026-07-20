import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { CategoryAlreadyExistsError } from "../errors/category-already-exists-error.js";

type CreateCategoryRequest = {
  name: string;
  color: string;
  description?: string | undefined;
  icon: string;
  userId: string;
};

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({ name, userId, color, description, icon }: CreateCategoryRequest) {
    const categoryWithSameName = await this.categoryRepository.findByNameAndUserId(userId, name);

    if (categoryWithSameName) {
      throw new CategoryAlreadyExistsError();
    }

    const category = await this.categoryRepository.create({
      name,
      color,
      description: description ?? null,
      icon,
      userId,
    });

    return { category };
  }
}
