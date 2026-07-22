import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gql, signUpAndAuthenticate, startTestServer } from "./helpers.js";

const CREATE_CATEGORY = `
  mutation CreateCategory($name: String!, $color: String!, $icon: String!) {
    createCategory(name: $name, color: $color, icon: $icon) {
      id
      name
    }
  }
`;

const CREATE_TRANSACTION = `
  mutation CreateTransaction(
    $name: String!
    $value: Int!
    $type: TransactionType!
    $date: String
    $categoryId: ID
  ) {
    createTransaction(name: $name, value: $value, type: $type, date: $date, categoryId: $categoryId) {
      id
    }
  }
`;

const CATEGORY_SPENDING = `
  query CategorySpending($month: String!) {
    categorySpending(month: $month) {
      id
      name
      total
      count
    }
  }
`;

type SpendingResult = {
  categorySpending: { id: string; name: string; total: number; count: number }[];
};

async function createCategory(url: string, token: string, name: string) {
  const { createCategory } = await gql<{ createCategory: { id: string; name: string } }>(
    url,
    CREATE_CATEGORY,
    { name, color: "#16a34a", icon: "ShoppingCart" },
    token,
  );

  return createCategory;
}

async function createTransaction(
  url: string,
  token: string,
  overrides: Record<string, unknown>,
) {
  await gql<{ createTransaction: { id: string } }>(
    url,
    CREATE_TRANSACTION,
    { name: "seed", value: 1000, type: "EXPENSE", ...overrides },
    token,
  );
}

describe("Category spending (e2e)", () => {
  let app: FastifyInstance;
  let url: string;

  beforeAll(async () => {
    const server = await startTestServer();
    app = server.app;
    url = server.url;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns monthly expense totals per category, sorted by total desc", async () => {
    const token = await signUpAndAuthenticate(url);
    const alimentacao = await createCategory(url, token, "Alimentação");
    const transporte = await createCategory(url, token, "Transporte");

    const nov = new Date(2025, 10, 15).toISOString();
    const oct = new Date(2025, 9, 15).toISOString();

    await createTransaction(url, token, { type: "EXPENSE", value: 5000, date: nov, categoryId: alimentacao.id });
    await createTransaction(url, token, { type: "EXPENSE", value: 3000, date: nov, categoryId: alimentacao.id });
    await createTransaction(url, token, { type: "EXPENSE", value: 2000, date: nov, categoryId: transporte.id });
    await createTransaction(url, token, { type: "INCOME", value: 9000, date: nov, categoryId: alimentacao.id });
    await createTransaction(url, token, { type: "EXPENSE", value: 1000, date: oct, categoryId: alimentacao.id });

    const { categorySpending } = await gql<SpendingResult>(
      url,
      CATEGORY_SPENDING,
      { month: "2025-11" },
      token,
    );

    expect(categorySpending).toEqual([
      expect.objectContaining({ id: alimentacao.id, total: 8000, count: 2 }),
      expect.objectContaining({ id: transporte.id, total: 2000, count: 1 }),
    ]);
  });

  it("rejects an unauthenticated request", async () => {
    await expect(
      gql(url, CATEGORY_SPENDING, { month: "2025-11" }),
    ).rejects.toThrow();
  });
});
