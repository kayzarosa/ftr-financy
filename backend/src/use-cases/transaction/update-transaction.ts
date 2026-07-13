import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import type { ITransactionRepository } from "@/domain/repositories/transaction-repository.js";
import type { TransactionType } from "@/generated/prisma/enums.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";
import { TransactionNotFoundError } from "../errors/transaction-not-found-error.js";

type UpdateTransactionRequest = {
  id: string;
  name?: string | undefined;
  value?: number | undefined;
  type?: TransactionType | undefined;
  date?: Date | undefined;
  userId: string;
  categoryId?: string | null | undefined;
};

export class UpdateTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute({ id, categoryId, userId, date, name, type, value }: UpdateTransactionRequest) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction || transaction.userId !== userId) {
      throw new TransactionNotFoundError();
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      if (!category || category.userId !== userId) {
        throw new CategoryNotFoundError();
      }
    }

    const updated = await this.transactionRepository.update(id, {
      ...(name !== undefined && { name }),
      ...(categoryId !== undefined && { categoryId }),
      ...(date !== undefined && { date }),
      ...(value !== undefined && { value }),
      ...(type !== undefined && { type }),
    });

    return { transaction: updated };
  }
}
