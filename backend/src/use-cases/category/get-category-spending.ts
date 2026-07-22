import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";

type GetCategorySpendingRequest = {
  userId: string;
  month: string;
};

export class GetCategorySpendingUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({ userId, month }: GetCategorySpendingRequest) {
    const categories = await this.categoryRepository.findSpendingByMonth(
      userId,
      month,
    );

    return { categories };
  }
}
