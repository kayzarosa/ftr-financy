import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const CATEGORY_SPENDING = gql`
  query CategorySpending($month: String!) {
    categorySpending(month: $month) {
      id
      name
      color
      icon
      total
      count
    }
  }
`;

type CategorySpendingResponse = {
  categorySpending: {
    id: string;
    name: string;
    color: string;
    icon: string;
    total: number;
    count: number;
  }[];
};

export function useCategorySpending(month: string) {
  return useQuery({
    queryKey: ["transactions", "categorySpending", month],
    queryFn: () =>
      request<CategorySpendingResponse>(CATEGORY_SPENDING, { month }),
  });
}
