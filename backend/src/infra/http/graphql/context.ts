import { verifyToken } from "@/infra/crypto/jwt.js";

export interface GraphQLContext {
  userId: string | null;
}

export function buildContext(authorizationHeader: string | undefined): GraphQLContext {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return { userId: null };
  }

  const token = authorizationHeader.replace("Bearer ", "");

  try {
    const userId = verifyToken(token);
    return { userId };
  } catch (_error) {
    return { userId: null };
  }
}
