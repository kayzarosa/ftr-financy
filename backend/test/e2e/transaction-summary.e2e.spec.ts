import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gql, signUpAndAuthenticate, startTestServer } from "./helpers.js";

const CREATE_TRANSACTION = `
  mutation CreateTransaction(
    $name: String!
    $value: Int!
    $type: TransactionType!
    $date: String
  ) {
    createTransaction(name: $name, value: $value, type: $type, date: $date) {
      id
    }
  }
`;

const TRANSACTION_SUMMARY = `
  query TransactionSummary($month: String) {
    transactionSummary(month: $month) {
      balance
      income
      expense
    }
  }
`;

type SummaryResult = {
  transactionSummary: { balance: number; income: number; expense: number };
};

async function createTransaction(
  url: string,
  token: string,
  overrides: Record<string, unknown>,
) {
  return gql<{ createTransaction: { id: string } }>(
    url,
    CREATE_TRANSACTION,
    { name: "Transação", value: 1000, type: "EXPENSE", ...overrides },
    token,
  );
}

describe("Transaction summary (e2e)", () => {
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

  it("computes all-time balance and month income/expense", async () => {
    const token = await signUpAndAuthenticate(url);

    await createTransaction(url, token, {
      type: "INCOME",
      value: 5000,
      date: new Date(2025, 10, 15).toISOString(),
    });
    await createTransaction(url, token, {
      type: "EXPENSE",
      value: 2000,
      date: new Date(2025, 10, 20).toISOString(),
    });
    await createTransaction(url, token, {
      type: "INCOME",
      value: 1000,
      date: new Date(2025, 9, 10).toISOString(),
    });

    const { transactionSummary } = await gql<SummaryResult>(
      url,
      TRANSACTION_SUMMARY,
      { month: "2025-11" },
      token,
    );

    expect(transactionSummary.balance).toBe(4000);
    expect(transactionSummary.income).toBe(5000);
    expect(transactionSummary.expense).toBe(2000);
  });

  it("returns zeros for a user without transactions", async () => {
    const token = await signUpAndAuthenticate(url);

    const { transactionSummary } = await gql<SummaryResult>(
      url,
      TRANSACTION_SUMMARY,
      { month: "2025-11" },
      token,
    );

    expect(transactionSummary).toEqual({ balance: 0, income: 0, expense: 0 });
  });

  it("rejects an unauthenticated request", async () => {
    await expect(
      gql(url, TRANSACTION_SUMMARY, { month: "2025-11" }),
    ).rejects.toThrow();
  });
});
