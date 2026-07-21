import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gql, signUpAndAuthenticate, startTestServer } from "./helpers.js";

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
      name
    }
  }
`;

const TRANSACTIONS = `
  query Transactions(
    $page: Int
    $limit: Int
    $type: TransactionType
    $categoryId: ID
    $search: String
    $month: String
  ) {
    transactions(
      page: $page
      limit: $limit
      type: $type
      categoryId: $categoryId
      search: $search
      month: $month
    ) {
      items {
        id
        name
        type
      }
      total
    }
  }
`;

type TransactionsResult = {
  transactions: {
    items: { id: string; name: string; type: "INCOME" | "EXPENSE" }[];
    total: number;
  };
};

async function createTransaction(
  url: string,
  token: string,
  overrides: Record<string, unknown> = {},
) {
  return gql<{ createTransaction: { id: string; name: string } }>(
    url,
    CREATE_TRANSACTION,
    {
      name: "Transação",
      value: 1000,
      type: "EXPENSE",
      ...overrides,
    },
    token,
  );
}

describe("Transaction (e2e)", () => {
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

  it("lists the user's transactions with the full total", async () => {
    const token = await signUpAndAuthenticate(url);

    await createTransaction(url, token, { name: "Mercado" });
    await createTransaction(url, token, { name: "Salário", type: "INCOME" });

    const { transactions } = await gql<TransactionsResult>(
      url,
      TRANSACTIONS,
      { page: 1, limit: 10 },
      token,
    );

    expect(transactions.items).toHaveLength(2);
    expect(transactions.total).toBe(2);
  });

  it("paginates while reporting the full total", async () => {
    const token = await signUpAndAuthenticate(url);

    await createTransaction(url, token, { name: "A", date: new Date(2025, 0, 1).toISOString() });
    await createTransaction(url, token, { name: "B", date: new Date(2025, 1, 1).toISOString() });
    await createTransaction(url, token, { name: "C", date: new Date(2025, 2, 1).toISOString() });

    const firstPage = await gql<TransactionsResult>(
      url,
      TRANSACTIONS,
      { page: 1, limit: 2 },
      token,
    );

    expect(firstPage.transactions.items).toHaveLength(2);
    expect(firstPage.transactions.total).toBe(3);
    expect(firstPage.transactions.items.map((t) => t.name)).toEqual(["C", "B"]);

    const secondPage = await gql<TransactionsResult>(
      url,
      TRANSACTIONS,
      { page: 2, limit: 2 },
      token,
    );

    expect(secondPage.transactions.items).toHaveLength(1);
    expect(secondPage.transactions.total).toBe(3);
    expect(secondPage.transactions.items[0]?.name).toBe("A");
  });

  it("filters by type", async () => {
    const token = await signUpAndAuthenticate(url);

    await createTransaction(url, token, { name: "Salário", type: "INCOME" });
    await createTransaction(url, token, { name: "Mercado", type: "EXPENSE" });

    const { transactions } = await gql<TransactionsResult>(
      url,
      TRANSACTIONS,
      { page: 1, limit: 10, type: "EXPENSE" },
      token,
    );

    expect(transactions.total).toBe(1);
    expect(transactions.items[0]?.name).toBe("Mercado");
  });

  it("filters by name search case-insensitively", async () => {
    const token = await signUpAndAuthenticate(url);

    await createTransaction(url, token, { name: "Jantar no restaurante" });
    await createTransaction(url, token, { name: "Mercado" });

    const { transactions } = await gql<TransactionsResult>(
      url,
      TRANSACTIONS,
      { page: 1, limit: 10, search: "jant" },
      token,
    );

    expect(transactions.total).toBe(1);
    expect(transactions.items[0]?.name).toBe("Jantar no restaurante");
  });

  it("filters by month", async () => {
    const token = await signUpAndAuthenticate(url);

    await createTransaction(url, token, {
      name: "Novembro",
      date: new Date(2025, 10, 15).toISOString(),
    });
    await createTransaction(url, token, {
      name: "Outubro",
      date: new Date(2025, 9, 15).toISOString(),
    });

    const { transactions } = await gql<TransactionsResult>(
      url,
      TRANSACTIONS,
      { page: 1, limit: 10, month: "2025-11" },
      token,
    );

    expect(transactions.total).toBe(1);
    expect(transactions.items[0]?.name).toBe("Novembro");
  });

  it("rejects an unauthenticated request", async () => {
    await expect(
      gql(url, TRANSACTIONS, { page: 1, limit: 10 }),
    ).rejects.toThrow();
  });
});
