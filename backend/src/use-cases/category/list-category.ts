import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";

type ListCategoriesRequest = {
  userId: string;
};

export class ListCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({ userId }: ListCategoriesRequest) {
    const categories = await this.categoryRepository.findManyByUserId(userId);

    return { categories };
  }
}
