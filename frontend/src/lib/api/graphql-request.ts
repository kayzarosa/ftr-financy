import { ClientError } from "graphql-request";
import { graphqlClient } from "@/lib/api/graphql-client";
import { queryClient } from "@/lib/api/query-client";
import { useAuthStore } from "@/stores/auth-store";

const REFRESH_TOKEN = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
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

type RefreshTokenResponse = {
  refreshToken: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string };
  };
};

function isUnauthenticatedError(error: unknown) {
  return (
    error instanceof ClientError &&
    error.response.errors?.some(
      (graphQLError) => graphQLError.extensions?.code === "UNAUTHENTICATED",
    )
  );
}

function signOut() {
  useAuthStore.getState().logout();
  queryClient.clear();
}

let refreshing: Promise<void> | null = null;

async function doRefresh(currentRefreshToken: string) {
  const data = await graphqlClient.request<RefreshTokenResponse>(REFRESH_TOKEN, {
    refreshToken: currentRefreshToken,
  });

  useAuthStore.getState().setAuth(data.refreshToken);
}

function refreshOnce(currentRefreshToken: string) {
  if (!refreshing) {
    refreshing = doRefresh(currentRefreshToken).finally(() => {
      refreshing = null;
    });
  }

  return refreshing;
}

export async function request<T>(query: string, variables?: object): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    if (!isUnauthenticatedError(error)) {
      throw error;
    }

    const currentRefreshToken = useAuthStore.getState().refreshToken;
    if (!currentRefreshToken) {
      signOut();
      throw error;
    }

    try {
      await refreshOnce(currentRefreshToken);

      return await graphqlClient.request<T>(query, variables);
    } catch {
      signOut();
      throw error;
    }
  }
}
