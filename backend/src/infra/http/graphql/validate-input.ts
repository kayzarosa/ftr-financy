import { GraphQLError } from "graphql";
import { type ZodType, z } from "zod";

export function validateInput<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new GraphQLError("Dados inválidos", {
      extensions: {
        code: "BAD_USER_INPUT",
        issues: z.flattenError(result.error),
      },
    });
  }

  return result.data;
}
