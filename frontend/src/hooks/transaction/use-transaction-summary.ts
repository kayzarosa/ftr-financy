import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const TRANSACTION_SUMMARY = gql`
  query TransactionSummary($month: String) {
    transactionSummary(month: $month) {
      balance
      income
      expense
    }
  }
`;

type TransactionSummaryResponse = {
  transactionSummary: { balance: number; income: number; expense: number };
};

export function useTransactionSummary(month: string) {
  return useQuery({
    queryKey: ["transactions", "summary", month],
    queryFn: () => request<TransactionSummaryResponse>(TRANSACTION_SUMMARY, { month }),
  });
}