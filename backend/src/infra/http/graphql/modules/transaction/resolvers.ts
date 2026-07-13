import { GraphQLError } from "graphql";
import z from "zod";
import { makeCreateTransactionUseCase } from "@/infra/factories/transaction/make-create-transaction-use-case.js";
import type { GraphQLContext } from "@/infra/http/graphql/context.js";
import { ensureAuthenticated } from "@/infra/http/graphql/ensure-authenticated.js";
import { serializeDate } from "@/infra/http/graphql/serialize-date.js";
import { validateInput } from "@/infra/http/graphql/validate-input.js";
import { CategoryNotFoundError } from "@/use-cases/errors/category-not-found-error.js";
import { UserNotExistsError } from "@/use-cases/errors/user-not-exists-error.js";
import { makeUpdateTransactionUseCase } from "@/infra/factories/transaction/make-update-transaction-use-case.js";
import { TransactionNotFoundError } from "@/use-cases/errors/transaction-not-found-error.js";

const createTransactionSchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio"),
  value: z
    .number()
    .int("O valor deve ser um número inteiro (em centavos)")
    .positive("O valor deve ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string(),
  categoryId: z.string().optional(),
});

const updateTransactionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome não pode ser vazio").optional(),
  value: z
    .number()
    .int("O valor deve ser um número inteiro (em centavos)")
    .positive("O valor deve ser maior que zero")
    .optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
});

const deleteTransactionSchema = z.object({
  id: z.string(),
});

export const transactionResolvers = {
  Transaction: {
    createdAt: (parent: { createdAt: Date | number }) =>
      serializeDate(parent.createdAt),
  },

  Query: {
    categories: async (_: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = ensureAuthenticated(context);

      const { categories } = await makeListCategoriesUseCase().execute({
        userId,
      });

      return categories;
    },
  },

  Mutation: {
    createTransaction: async (
      _: unknown,
      args: {
        name: string;
        value: number;
        type: "INCOME" | "EXPENSE";
        date?: string;
        categoryId?: string;
      },
      context: GraphQLContext,
    ) => {
      try {
        const userId = ensureAuthenticated(context);

        const data = validateInput(createTransactionSchema, args);

        const { transaction } = await makeCreateTransactionUseCase().execute({
          name: data.name,
          value: data.value,
          type: data.type,
          date: data.date ? new Date(data.date) : new Date(),
          categoryId: data.categoryId ?? null,
          userId,
        });

        return transaction;
      } catch (error) {
        if (error instanceof CategoryNotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "CATEGORY_NOT_FOUND" },
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

    updateTransaction: async (
      _: unknown,
      args: {
        id: string;
        name?: string;
        value?: number;
        type?: "INCOME" | "EXPENSE";
        date?: string;
        categoryId?: string | null;
      },
      context: GraphQLContext,
    ) => {
      try {
        const userId = ensureAuthenticated(context);

        const data = validateInput(updateTransactionSchema, args);

        const { transaction } = await makeUpdateTransactionUseCase().execute({
          ...data,
          date: data.date ? new Date(data.date) : undefined,
          userId,
        });

        return transaction;
      } catch (error) {
        if (error instanceof TransactionNotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "TRANSACTION_NOT_EXISTS" },
          });
        }
        if (error instanceof CategoryNotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "CATEGORY_NOT_FOUND" },
          });
        }
        throw error;
      }
    },

    deleteCategory: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = ensureAuthenticated(context);

        const data = validateInput(deleteCategorySchema, args);

        await makeDeleteCategoryUseCase().execute({ ...data, userId });

        return true;
      } catch (error) {
        if (error instanceof CategoryNotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "CATEGORY_NOT_FOUND" },
          });
        }
        throw error;
      }
    },
  },
};
