import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $id: ID!
    $name: String!
    $description: String
    $icon: String
    $color: String
  ) {
    updateCategory(
      id: $id
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
  id: string;
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
    icon: string | null;
    color: string | null;
  };
};

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) => request<CategoryResponse>(UPDATE_CATEGORY, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categoriesCountTransactions"],
      });
    },
  });
}
