import type { ITransactionRepository } from "@/domain/repositories/transaction-repository.js";

type ListTransactionRequest = {
  userId: string;
};

export class ListTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute({ userId }: ListTransactionRequest) {
    const transactions = await this.transactionRepository.findManyByUserId(userId);

    return { transactions };
  }
}
