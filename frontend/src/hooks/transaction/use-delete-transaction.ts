import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

type TransactionInput = {
  id: string;
};

type TransactionResponse = {
  deleteTransaction: boolean;
};

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionInput) =>
      request<TransactionResponse>(DELETE_TRANSACTION, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["categoriesCountTransactions"],
      });
    },
  });
}
