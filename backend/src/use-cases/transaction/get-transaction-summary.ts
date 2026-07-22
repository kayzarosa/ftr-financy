import type { ITransactionRepository } from "@/domain/repositories/transaction-repository.js";

type GetTransactionSummaryRequest = {
  userId: string;
  month?: string;
};

export class GetTransactionSummaryUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute({ userId, month }: GetTransactionSummaryRequest) {
    const summary = await this.transactionRepository.getSummaryByUserId(
      userId,
      month,
    );

    return { summary };
  }
}
