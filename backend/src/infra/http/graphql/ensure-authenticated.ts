import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context.js";

export function ensureAuthenticated(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Não autenticado", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.userId;
}
