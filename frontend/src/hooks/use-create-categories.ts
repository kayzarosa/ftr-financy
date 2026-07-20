import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $description: String
    $icon: String
    $color: String
  ) {
    createCategory(
      name: $name
      description: $description
      icon: $icon
      color: $color
    ) {
      id
      name
      description
      icon
      color
    }
  }
`;

type CategoryInput = {
  name: string;
  description: string | null;
  color: string;
  icon: string;
};

type CategoryResponse = {
  createCategory: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
  };
};

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) => request<CategoryResponse>(CREATE_CATEGORY, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categoriesCountTransactions"],
      });
    },
  });
}
