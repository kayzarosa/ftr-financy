import { ClientError } from "graphql-request";

export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente.") {
  if (error instanceof ClientError) {
    return error.response.errors?.[0]?.message ?? fallback;
  }

  return fallback;
}
