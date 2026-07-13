import type { ITransactionRepository } from "@/domain/repositories/transaction-repository.js";
import { TransactionNotFoundError } from "../errors/transaction-not-found-error.js";

type DeleteTransactionRequest = {
  id: string;
  userId: string;
};

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute({ id, userId }: DeleteTransactionRequest) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction || transaction.userId !== userId) {
      throw new TransactionNotFoundError();
    }

    await this.transactionRepository.delete(id);
  }
}
