import { GraphQLError } from "graphql";
import z from "zod";
import { makeCreateCategoryUseCase } from "@/infra/factories/make-create-category-use-case.js";
import type { GraphQLContext } from "@/infra/http/graphql/context.js";
import { ensureAuthenticated } from "@/infra/http/graphql/ensure-authenticated.js";
import { serializeDate } from "@/infra/http/graphql/serialize-date.js";
import { validateInput } from "@/infra/http/graphql/validate-input.js";
import { CategoryAlreadyExistsError } from "@/use-cases/errors/category-already-exists-error.js";
import { makeUpdateCategoryUseCase } from "@/infra/factories/make-update-category-use-case.js";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio"),
  color: z.string().min(3, "A cor deve ter no minimo 6 carecteres").optional(),
});

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome não pode ser vazio").optional(),
  color: z.string().min(3, "A cor deve ter no minimo 6 carecteres").optional(),
});

export const categoryResolvers = {
  Category: {
    createdAt: (parent: { createdAt: Date | number }) => serializeDate(parent.createdAt),
  },

  Mutation: {
    createCategory: async (
      _: unknown,
      args: { name: string; color?: string },
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
      args: { id: string, name?: string; color?: string },
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
        throw error;
      }
    },
  },
};
