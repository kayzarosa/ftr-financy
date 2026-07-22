import { GraphQLError } from "graphql";
import z from "zod";
import { PrismaCategoryRepository } from "@/infra/database/prisma/repositories/prisma-category-repository.js";
import { makeCreateTransactionUseCase } from "@/infra/factories/transaction/make-create-transaction-use-case.js";
import { makeDeleteTransactionUseCase } from "@/infra/factories/transaction/make-delete-transaction-use-case.js";
import { makeListTransactionUseCase } from "@/infra/factories/transaction/make-list-transactions-use-case.js";
import { makeUpdateTransactionUseCase } from "@/infra/factories/transaction/make-update-transaction-use-case.js";
import type { GraphQLContext } from "@/infra/http/graphql/context.js";
import { ensureAuthenticated } from "@/infra/http/graphql/ensure-authenticated.js";
import { serializeDate } from "@/infra/http/graphql/serialize-date.js";
import { validateInput } from "@/infra/http/graphql/validate-input.js";
import { CategoryNotFoundError } from "@/use-cases/errors/category-not-found-error.js";
import { TransactionNotFoundError } from "@/use-cases/errors/transaction-not-found-error.js";
import { UserNotExistsError } from "@/use-cases/errors/user-not-exists-error.js";
import { makeGetTransactionSummaryUseCase } from "@/infra/factories/transaction/make-get-transaction-summary-use-case.js";

const createTransactionSchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio"),
  value: z
    .number()
    .int("O valor deve ser um número inteiro (em centavos)")
    .positive("O valor deve ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().optional(),
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

const listTransactionsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Formato esperado: YYYY-MM")
    .optional(),
});

const transactionSummarySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Formato esperado: YYYY-MM")
    .optional(),
});

export const transactionResolvers = {
  Transaction: {
    date: (parent: { date: Date | number }) => serializeDate(parent.date),
    createdAt: (parent: { createdAt: Date | number }) =>
      serializeDate(parent.createdAt),
    category: async (parent: { categoryId: string | null }) => {
      if (!parent.categoryId) return null;

      const categoryRepository = new PrismaCategoryRepository();
      return categoryRepository.findById(parent.categoryId);
    },
  },

  Query: {
    transactions: async (
      _: unknown,
      args: unknown,
      context: GraphQLContext,
    ) => {
      const userId = ensureAuthenticated(context);

      const params = validateInput(listTransactionsSchema, args);

      const { transactions, total } =
        await makeListTransactionUseCase().execute({
          userId,
          params,
        });

      return { items: transactions, total };
    },
    transactionSummary: async (
      _: unknown,
      args: unknown,
      context: GraphQLContext,
    ) => {
      const userId = ensureAuthenticated(context);

      const { month } = validateInput(transactionSummarySchema, args);

      const { summary } = await makeGetTransactionSummaryUseCase().execute({
        userId,
        ...(month && { month }),
      });

      return summary;
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
            extensions: { code: "TRANSACTION_NOT_FOUND" },
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

    deleteTransaction: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = ensureAuthenticated(context);

        const data = validateInput(deleteTransactionSchema, args);

        await makeDeleteTransactionUseCase().execute({ ...data, userId });

        return true;
      } catch (error) {
        if (error instanceof TransactionNotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "TRANSACTION_NOT_FOUND" },
          });
        }
        throw error;
      }
    },
  },
};
