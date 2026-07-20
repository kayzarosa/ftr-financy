import { ApolloServer } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import { buildContext, type GraphQLContext } from "@/infra/http/graphql/context.js";
import { authResolvers } from "@/infra/http/graphql/modules/auth/resolvers.js";
import { authTypeDefs } from "@/infra/http/graphql/modules/auth/typedefs.js";
import { categoryResolvers } from "@/infra/http/graphql/modules/category/resolvers.js";
import { categoryTypeDefs } from "@/infra/http/graphql/modules/category/typedefs.js";
import { transactionResolvers } from "@/infra/http/graphql/modules/transaction/resolvers.js";
import { transactionTypeDefs } from "@/infra/http/graphql/modules/transaction/typedefs.js";
import { userResolvers } from "@/infra/http/graphql/modules/user/resolvers.js";
import { userTypeDefs } from "@/infra/http/graphql/modules/user/typedefs.js";

const typeDefs = `#graphql
type Query {
  hello: String
}
${authTypeDefs}
${userTypeDefs}
${categoryTypeDefs}
${transactionTypeDefs}
`;

const resolvers = {
  Query: {
    hello: () => "Financy API rodando!",
    ...categoryResolvers.Query,
    ...transactionResolvers.Query,
  },
  User: {
    ...authResolvers.User,
  },
  Category: {
    ...categoryResolvers.Category,
  },
  Transaction: {
    ...transactionResolvers.Transaction,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },
};

export async function buildApp() {
  const app = fastify();

  await app.register(fastifyCors, { origin: "*" });

  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });
  await apollo.start();

  await app.register(fastifyApollo(apollo), {
    prefix: "/graphql",
    context: async (request) => buildContext(request.headers.authorization),
  });

  return app;
}
