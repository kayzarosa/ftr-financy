import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const TRANSACTIONS_COUNT = gql`
  query TransactionsCount {
    transactions {
      total
    }
  }
`;

type TransactionsCountResponse = {
  transactions: { total: number };
};

export function useTransactionsCount() {
  return useQuery({
    queryKey: ["transactions", "count"],
    queryFn: () => request<TransactionsCountResponse>(TRANSACTIONS_COUNT),
  });
}
