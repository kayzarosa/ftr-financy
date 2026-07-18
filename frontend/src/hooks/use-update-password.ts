import { useMutation } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/graphql-request";

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($oldPassword: String!, $newPassword: String!) {
    updatePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

type UpdatePasswordInput = { oldPassword: string; newPassword: string };
type UpdatePasswordResponse = { updatePassword: boolean };

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      request<UpdatePasswordResponse>(UPDATE_PASSWORD, input),
  });
}
