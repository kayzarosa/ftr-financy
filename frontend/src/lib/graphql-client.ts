import { GraphQLClient } from "graphql-request";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";

export const graphqlClient = new GraphQLClient(env.VITE_BACKEND_URL, {
  requestMiddleware: (request) => {
    const token = useAuthStore.getState().accessToken;

    return {
      ...request,
      headers: {
        ...request.headers,
        "Content-Type": "application/json",
        "apollo-require-preflight": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  },
});
