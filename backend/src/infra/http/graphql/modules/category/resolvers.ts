import { GraphQLError } from "graphql";
import z from "zod";
import { makeCreateCategoryUseCase } from "@/infra/factories/category/make-create-category-use-case.js";
import { makeDeleteCategoryUseCase } from "@/infra/factories/category/make-delete-category-use-case.js";
import { makeListCategoriesCountTransactionsUseCase } from "@/infra/factories/category/make-list-categories-count-transactions-use-case.js";
import { makeListCategoriesUseCase } from "@/infra/factories/category/make-list-categories-use-case.js";
import { makeUpdateCategoryUseCase } from "@/infra/factories/category/make-update-category-use-case.js";
import type { GraphQLContext } from "@/infra/http/graphql/context.js";
import { ensureAuthenticated } from "@/infra/http/graphql/ensure-authenticated.js";
import { serializeDate } from "@/infra/http/graphql/serialize-date.js";
import { validateInput } from "@/infra/http/graphql/validate-input.js";
import { CategoryAlreadyExistsError } from "@/use-cases/errors/category-already-exists-error.js";
import { CategoryNotFoundError } from "@/use-cases/errors/category-not-found-error.js";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio"),
  color: z.string().min(3, "A cor deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  icon: z.string(),
});

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome não pode ser vazio").optional(),
  color: z.string().min(3, "A cor deve ter no mínimo 3 caracteres").optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const deleteCategorySchema = z.object({
  id: z.string(),
});

export const categoryResolvers = {
  Category: {
    createdAt: (parent: { createdAt: Date | number }) => serializeDate(parent.createdAt),
  },

  Query: {
    categories: async (_: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = ensureAuthenticated(context);

      const { categories } = await makeListCategoriesUseCase().execute({ userId });

      return categories;
    },

    categoriesCountTransactions: async (_: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = ensureAuthenticated(context);

      const { categories } = await makeListCategoriesCountTransactionsUseCase().execute({
        userId,
      });

      return categories;
    },
  },

  Mutation: {
    createCategory: async (
      _: unknown,
      args: { name: string; color: string; description?: string; icon: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = ensureAuthenticated(context);

        const data = validateInput(createCategorySchema, args);

        const { category } = await makeCreateCategoryUseCase().execute({
          ...data,
          userId,
        });

        return category;
      } catch (error) {
        if (error instanceof CategoryAlreadyExistsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "CATEGORY_ALREADY_EXISTS" },
          });
        }
        throw error;
      }
    },

    updateCategory: async (
      _: unknown,
      args: { id: string; name?: string; color?: string; description?: string; icon?: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = ensureAuthenticated(context);

        const data = validateInput(updateCategorySchema, args);

        const { category } = await makeUpdateCategoryUseCase().execute({
          ...data,
          userId,
        });

        return category;
      } catch (error) {
        if (error instanceof CategoryAlreadyExistsError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "CATEGORY_ALREADY_EXISTS" },
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

    deleteCategory: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
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
