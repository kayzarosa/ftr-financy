import type {
  ITransactionRepository,
  ListTransactionsParams,
} from "@/domain/repositories/transaction-repository.js";

type ListTransactionRequest = {
  userId: string;
  params: ListTransactionsParams;
};

export class ListTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute({ userId, params }: ListTransactionRequest) {
    const { transactions, total } = await this.transactionRepository.findManyByUserId(
      userId,
      params,
    );

    return { transactions, total };
  }
}
