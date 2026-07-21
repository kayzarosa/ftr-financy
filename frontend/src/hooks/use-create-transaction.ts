import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const CREATE_TRANSACTION = gql`
  mutation CreateTransaction(
    $name: String!
    $value: Int!
    $type: TransactionType!
    $date: String
    $categoryId: ID
  ) {
    createTransaction(
      name: $name
      value: $value
      type: $type
      date: $date
      categoryId: $categoryId
    ) {
      id
    }
  }
`;

type CreateTransactionInput = {
  name: string;
  value: number;
  type: "INCOME" | "EXPENSE";
  date?: string;
  categoryId?: string;
};

type CreateTransactionResponse = { createTransaction: { id: string } };

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      request<CreateTransactionResponse>(CREATE_TRANSACTION, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["categoriesCountTransactions"],
      });
    },
  });
}
