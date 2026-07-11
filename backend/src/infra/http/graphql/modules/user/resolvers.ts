import { GraphQLError } from "graphql";
import { makeUpdatePasswordUseCase } from "@/infra/factories/make-update-password-use-case.js";
import { makeUpdateUserUseCase } from "@/infra/factories/make-update-user-use-case.js";
import type { GraphQLContext } from "@/infra/http/graphql/context.js";
import { InvalidOldPasswordError } from "@/use-cases/errors/invalid-old-password-error.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";
import { UserNotExistsError } from "@/use-cases/errors/user-not-exists-error.js";

function ensureAuthenticated(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Não autenticado", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.userId;
}

export const userResolvers = {
  Mutation: {
    updateUser: async (
      _: unknown,
      args: { name?: string; email?: string },
      context: GraphQLContext,
    ) => {
      const userId = ensureAuthenticated(context);

      try {
        const { userUpdated } = await makeUpdateUserUseCase().execute({
          id: userId,
          ...args,
        });
        return userUpdated;
      } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "USER_ALREADY_EXISTS" },
          });
        }
        if (error instanceof UserNotExistsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }
        throw error;
      }
    },

    updatePassword: async (
      _: unknown,
      args: { oldPassword: string; newPassword: string },
      context: GraphQLContext,
    ) => {
      const userId = ensureAuthenticated(context);

      try {
        await makeUpdatePasswordUseCase().execute({ id: userId, ...args });
        return true;
      } catch (error) {
        if (error instanceof InvalidOldPasswordError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "INVALID_OLD_PASSWORD" },
          });
        }
        if (error instanceof UserNotExistsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }
        throw error;
      }
    },
  },
};
