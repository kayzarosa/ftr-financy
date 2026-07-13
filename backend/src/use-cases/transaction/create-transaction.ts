import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import type { ITransactionRepository } from "@/domain/repositories/transaction-repository.js";
import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import type { TransactionType } from "@/generated/prisma/enums.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";
import { UserNotExistsError } from "../errors/user-not-exists-error.js";

type CreateTransactionRequest = {
  name: string;
  value: number;
  type: TransactionType;
  date: Date;
  userId: string;
  categoryId: string | null;
};

export class CreateTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private userRepository: IUserRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute({ categoryId, date, name, type, userId, value }: CreateTransactionRequest) {
    const userExists = await this.userRepository.findById(userId);

    if (!userExists) {
      throw new UserNotExistsError();
    }

    if (categoryId) {
      const categoryExist = await this.categoryRepository.findById(categoryId);

      if (!categoryExist) {
        throw new CategoryNotFoundError();
      }
    }

    const transaction = await this.transactionRepository.create({
      userId,
      categoryId,
      name,
      date,
      type,
      value,
    });

    return { transaction };
  }
}
