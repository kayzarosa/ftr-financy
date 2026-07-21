import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const CATEGORY_LIST = gql`
  query Categories {
    categories {
      id
      name
      description
      icon
      color
    }
  }
`;

type Category = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
};

type CategoriesResponse = { categories: Category[] };

export function useCategoriesList() {
  return useQuery({
    queryKey: ["categoriesList"],
    queryFn: () => request<CategoriesResponse>(CATEGORY_LIST),
  });
}
