import { useMutation } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const UPDATE_USER = gql`
  mutation UpdateUser($name: String, $email: String) {
    updateUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

type UpdateUserInput = { name?: string; email?: string };
type UpdateUserResponse = {
  updateUser: { id: string; name: string; email: string };
};

export function useUpdateUser() {
  return useMutation({
    mutationFn: (input: UpdateUserInput) => request<UpdateUserResponse>(UPDATE_USER, input),
  });
}
