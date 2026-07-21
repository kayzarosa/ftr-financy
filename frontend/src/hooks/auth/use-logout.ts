import { useMutation } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const LOGOUT = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

type LogoutInput = { refreshToken: string };
type LogoutResponse = { logout: boolean };

export function useLogout() {
  return useMutation({
    mutationFn: (input: LogoutInput) => request<LogoutResponse>(LOGOUT, input),
  });
}
