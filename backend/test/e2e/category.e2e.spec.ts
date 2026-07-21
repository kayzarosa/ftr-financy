import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gql, signUpAndAuthenticate, startTestServer } from "./helpers.js";

const CREATE_CATEGORY = `
  mutation CreateCategory($name: String!, $color: String!, $icon: String!) {
    createCategory(name: $name, color: $color, icon: $icon) {
      id
      name
      color
      icon
    }
  }
`;

const CATEGORIES_COUNT = `
  query {
    categoriesCountTransactions {
      id
      name
      transactionsCount
    }
  }
`;

const CREATE_TRANSACTION = `
  mutation CreateTransaction(
    $name: String!
    $value: Int!
    $type: TransactionType!
    $categoryId: ID
  ) {
    createTransaction(name: $name, value: $value, type: $type, categoryId: $categoryId) {
      id
      category {
        id
      }
    }
  }
`;

const DELETE_CATEGORY = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const TRANSACTIONS = `
  query {
    transactions {
      items {
        id
        category {
          id
        }
      }
      total
    }
  }
`;

describe("Category (e2e)", () => {
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

  it("creates and lists a category through the API", async () => {
    const token = await signUpAndAuthenticate(url);

    const { createCategory } = await gql<{
      createCategory: { id: string; name: string; color: string; icon: string };
    }>(url, CREATE_CATEGORY, { name: "Mercado", color: "#16a34a", icon: "ShoppingCart" }, token);

    expect(createCategory.id).toEqual(expect.any(String));
    expect(createCategory.name).toBe("Mercado");
    expect(createCategory.color).toBe("#16a34a");
    expect(createCategory.icon).toBe("ShoppingCart");

    const { categoriesCountTransactions } = await gql<{
      categoriesCountTransactions: { id: string; transactionsCount: number }[];
    }>(url, CATEGORIES_COUNT, undefined, token);

    expect(categoriesCountTransactions).toHaveLength(1);
    expect(categoriesCountTransactions[0]?.transactionsCount).toBe(0);
  });

  it("rejects creating a category without the now-required icon", async () => {
    const token = await signUpAndAuthenticate(url);

    await expect(
      gql(
        url,
        `mutation { createCategory(name: "Sem icone", color: "#000000") { id } }`,
        undefined,
        token,
      ),
    ).rejects.toThrow();
  });

  it("deleting a category does NOT delete its transaction — it only unlinks it", async () => {
    const token = await signUpAndAuthenticate(url);

    const { createCategory } = await gql<{ createCategory: { id: string } }>(
      url,
      CREATE_CATEGORY,
      { name: "Mercado", color: "#16a34a", icon: "ShoppingCart" },
      token,
    );

    const { createTransaction } = await gql<{
      createTransaction: { id: string; category: { id: string } | null };
    }>(
      url,
      CREATE_TRANSACTION,
      { name: "Compra do mês", value: 5000, type: "EXPENSE", categoryId: createCategory.id },
      token,
    );

    expect(createTransaction.category?.id).toBe(createCategory.id);

    const { deleteCategory } = await gql<{ deleteCategory: boolean }>(
      url,
      DELETE_CATEGORY,
      { id: createCategory.id },
      token,
    );

    expect(deleteCategory).toBe(true);

    const { transactions } = await gql<{
      transactions: {
        items: { id: string; category: { id: string } | null }[];
        total: number;
      };
    }>(url, TRANSACTIONS, undefined, token);

    expect(transactions.items).toHaveLength(1);
    expect(transactions.items[0]?.id).toBe(createTransaction.id);
    expect(transactions.items[0]?.category).toBeNull();
  });
});
