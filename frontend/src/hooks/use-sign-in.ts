import { useMutation } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql-client";

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
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

type SignInInput = {
  email: string;
  password: string;
};

type SignInResponse = {
  signIn: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string };
  };
};

export function useSignIn() {
  return useMutation({
    mutationFn: (input: SignInInput) => graphqlClient.request<SignInResponse>(SIGN_IN, input),
  });
}
