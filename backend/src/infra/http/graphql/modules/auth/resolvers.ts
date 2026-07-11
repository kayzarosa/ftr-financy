import { GraphQLError } from "graphql";
import z from "zod";
import { makeLogoutUseCase } from "@/infra/factories/make-logout-use-case.js";
import { makeRefreshTokenUseCase } from "@/infra/factories/make-refresh-token-use-case.js";
import { makeSignInUseCase } from "@/infra/factories/make-sign-in-use-case.js";
import { makeSignUpUseCase } from "@/infra/factories/make-sign-up-use-case.js";
import { serializeDate } from "@/infra/http/graphql/serialize-date.js";
import { validateInput } from "@/infra/http/graphql/validate-input.js";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";

const signUpSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email({ pattern: z.regexes.html5Email, message: "Email inválido" }),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signInSchema = z.object({
  email: z.email({ pattern: z.regexes.html5Email, message: "Email inválido" }),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const authResolvers = {
  User: {
    createdAt: (parent: { createdAt: Date | number }) => serializeDate(parent.createdAt),
  },

  Mutation: {
    signUp: async (_: unknown, args: { name: string; email: string; password: string }) => {
      try {
        const data = validateInput(signUpSchema, args);
        return await makeSignUpUseCase().execute(data);
      } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "USER_ALREADY_EXISTS" },
          });
        }
        throw error;
      }
    },

    signIn: async (_: unknown, args: { email: string; password: string }) => {
      try {
        const data = validateInput(signInSchema, args);
        return await makeSignInUseCase().execute(data);
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "INVALID_CREDENTIALS" },
          });
        }
        throw error;
      }
    },

    refreshToken: async (_: unknown, args: { refreshToken: string }) => {
      try {
        return await makeRefreshTokenUseCase().execute(args);
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "INVALID_CREDENTIALS" },
          });
        }
        throw error;
      }
    },

    logout: async (_: unknown, args: { refreshToken: string }) => {
      await makeLogoutUseCase().execute(args);
      return true;
    },
  },
};
