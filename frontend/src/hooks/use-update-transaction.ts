import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction(
    $id: ID!
    $name: String
    $value: Int
    $type: TransactionType
    $date: String
    $categoryId: ID
  ) {
    updateTransaction(
      id: $id
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

type UpdateTransactionInput = {
  id: string;
  name: string;
  value: number;
  type: "INCOME" | "EXPENSE";
  date?: string;
  categoryId?: string;
};

type UpdateTransactionResponse = { updateTransaction: { id: string } };

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTransactionInput) =>
      request<UpdateTransactionResponse>(UPDATE_TRANSACTION, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["categoriesCountTransactions"],
      });
    },
  });
}
