import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const LIST_TRANSACTIONS = gql`
  query Transactions(
    $page: Int
    $limit: Int
    $type: TransactionType
    $categoryId: ID
    $search: String
    $month: String
  ) {
    transactions(
      page: $page
      limit: $limit
      type: $type
      categoryId: $categoryId
      search: $search
      month: $month
    ) {
      items {
        id
        name
        value
        type
        date
        category {
          id
          name
          color
          icon
        }
      }
      total
    }
  }
`;

type Transaction = {
  id: string;
  name: string;
  value: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: { id: string; name: string; color: string; icon: string } | null;
};

type TransactionsResponse = {
  transactions: { items: Transaction[]; total: number };
};

type UseTransactionsParams = {
  page: number;
  type: "INCOME" | "EXPENSE" | "all";
  categoryId: string;
  search: string;
  month: string;
};

const LIMIT = 10;

export function useTransactions(params: UseTransactionsParams) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () =>
      request<TransactionsResponse>(LIST_TRANSACTIONS, {
        page: params.page,
        limit: LIMIT,
        type: params.type === "all" ? undefined : params.type,
        categoryId: params.categoryId === "all" ? undefined : params.categoryId,
        search: params.search || undefined,
        month: params.month,
      }),
    placeholderData: keepPreviousData,
  });
}
