import { GraphQLError } from "graphql";
import z from "zod";
import { makeUpdatePasswordUseCase } from "@/infra/factories/make-update-password-use-case.js";
import { makeUpdateUserUseCase } from "@/infra/factories/make-update-user-use-case.js";
import type { GraphQLContext } from "@/infra/http/graphql/context.js";
import { InvalidOldPasswordError } from "@/use-cases/errors/invalid-old-password-error.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";
import { UserNotExistsError } from "@/use-cases/errors/user-not-exists-error.js";
import { ensureAuthenticated } from "../../ensure-authenticated.js";
import { validateInput } from "../../validate-input.js";

const updateUserSchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio").optional(),
  email: z.email({ pattern: z.regexes.html5Email, message: "Email inválido" }).optional(),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

export const userResolvers = {
  Mutation: {
    updateUser: async (
      _: unknown,
      args: { name?: string; email?: string },
      context: GraphQLContext,
    ) => {
      const userId = ensureAuthenticated(context);

      try {
        const data = validateInput(updateUserSchema, args);
        const { userUpdated } = await makeUpdateUserUseCase().execute({
          id: userId,
          ...data,
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
        const data = validateInput(updatePasswordSchema, args);
        await makeUpdatePasswordUseCase().execute({ id: userId, ...data });
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
