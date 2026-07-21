import { useMutation } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { request } from "@/lib/api/graphql-request";

const SIGN_UP = gql`
  mutation SignUp($name: String!, $email: String!, $password: String!) {
    signUp(name: $name, email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

type SignUpResponse = {
  signUp: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string };
  };
};

export function useSignUp() {
  return useMutation({
    mutationFn: (input: SignUpInput) => request<SignUpResponse>(SIGN_UP, input),
  });
}
