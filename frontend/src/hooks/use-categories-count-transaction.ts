import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const CATEGORY_COUNT_TRANSACTIONS = gql`
  query CategoriesCountTransactions {
    categoriesCountTransactions {
      id
      name
      description
      icon
      color
      transactionsCount
    }
  }
`;

type Category = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  transactionsCount: number | null;
};

type CategoriesResponse = { categoriesCountTransactions: Category[] };

export function useCategoriesCountTransactions() {
  return useQuery({
    queryKey: ["categoriesCountTransactions"],
    queryFn: () => request<CategoriesResponse>(CATEGORY_COUNT_TRANSACTIONS),
    select: (data) =>
      data.categoriesCountTransactions.map((categories) => ({
        ...categories,
        transactionsCount: categories.transactionsCount ?? 0,
      })),
  });
}
