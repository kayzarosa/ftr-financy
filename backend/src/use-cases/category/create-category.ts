import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { CategoryAlreadyExistsError } from "../errors/category-already-exists-error.js";

type CreateCategoryRequest = {
  name: string;
  color?: string | undefined;
  description?: string | undefined;
  icon?: string | undefined;
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
      color: color ?? null,
      description: description ?? null,
      icon: icon ?? null,
      userId,
    });

    return { category };
  }
}
