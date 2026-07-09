import "dotenv/config";

import { ApolloServer } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import fastifyCors from "@fastify/cors";
import fastify from "fastify";

const typeDefs = `#graphql
type Query {
  hello: String
}`;

const resolvers = {
  Query: {
    hello: () => "Finacy Api rodando!",
  },
};

async function main() {
  const app = fastify();

  await app.register(fastifyCors, { origin: "*" });

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });
  await apollo.start();

  await app.register(fastifyApollo(apollo), {
    prefix: "/graphql",
  });

  app.listen({ port: 3333, host: "0.0.0.0" }, () => {
    console.log("🚀 Server ready at http://localhost:3333/graphql");
  });
}

main();
