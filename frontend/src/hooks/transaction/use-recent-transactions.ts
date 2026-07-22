import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const RECENT_TRANSACTIONS = gql`
  query RecentTransactions($page: Int, $limit: Int) {
    transactions(page: $page, limit: $limit) {
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

type RecentTransactionsResponse = {
  transactions: { items: Transaction[]; total: number };
};

const RECENT_LIMIT = 5;

export function useRecentTransactions() {
  return useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () =>
      request<RecentTransactionsResponse>(RECENT_TRANSACTIONS, {
        page: 1,
        limit: RECENT_LIMIT,
      }),
  });
}
