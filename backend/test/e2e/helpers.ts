import { prisma } from "@/infra/database/prisma/prisma.js";
import { buildApp } from "@/infra/http/build-app.js";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function startTestServer() {
  const app = await buildApp();
  await app.listen({ port: 0 });

  const address = app.server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;

  return { app, url: `http://localhost:${port}/graphql` };
}

export async function gql<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors) {
    throw new Error(body.errors[0]?.message ?? "GraphQL error");
  }

  return body.data as T;
}

export async function resetDatabase() {
  await prisma.transaction.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

const SIGN_UP = `
  mutation SignUp($name: String!, $email: String!, $password: String!) {
    signUp(name: $name, email: $email, password: $password) {
      accessToken
    }
  }
`;

let userCounter = 0;

export async function signUpAndAuthenticate(url: string) {
  userCounter++;

  const { signUp } = await gql<{ signUp: { accessToken: string } }>(url, SIGN_UP, {
    name: "Test User",
    email: `user-${userCounter}-${Date.now()}@test.com`,
    password: "password123",
  });

  return signUp.accessToken;
}
