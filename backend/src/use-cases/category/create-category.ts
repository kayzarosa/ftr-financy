import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { CategoryAlreadyExistsError } from "../errors/category-already-exists-error.js";

type CreateCategoryRequest = {
  name: string;
  color?: string | undefined;
  userId: string;
};

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({ name, userId, color }: CreateCategoryRequest) {
    const categoryWithSameName = await this.categoryRepository.findByNameAndUserId(userId, name);

    if (categoryWithSameName) {
      throw new CategoryAlreadyExistsError();
    }

    const category = await this.categoryRepository.create({
      name,
      ...(color !== undefined && { color }),
      userId,
    });

    return { category };
  }
}
