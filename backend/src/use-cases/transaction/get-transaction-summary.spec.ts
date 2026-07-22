import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { GetTransactionSummaryUseCase } from "./get-transaction-summary.js";

let repository: InMemoryTransactionRepository;
let sut: GetTransactionSummaryUseCase;

beforeEach(() => {
  repository = new InMemoryTransactionRepository();
  sut = new GetTransactionSummaryUseCase(repository);
});

async function seed(data: {
  userId: string;
  type: "INCOME" | "EXPENSE";
  value: number;
  date: Date;
}) {
  await repository.create({ name: "seed", categoryId: null, ...data });
}

describe("GetTransactionSummaryUseCase", () => {
  it("soma o balance no histórico inteiro e income/expense só no mês pedido", async () => {
    await seed({ userId: "user-1", type: "INCOME", value: 5000, date: new Date("2026-07-15") });
    await seed({ userId: "user-1", type: "EXPENSE", value: 2000, date: new Date("2026-07-20") });
    await seed({ userId: "user-1", type: "INCOME", value: 1000, date: new Date("2026-06-10") });
    await seed({ userId: "user-1", type: "EXPENSE", value: 500, date: new Date("2026-06-11") });

    const { summary } = await sut.execute({ userId: "user-1", month: "2026-07" });

    expect(summary.balance).toBe(3500);
    expect(summary.income).toBe(5000);
    expect(summary.expense).toBe(2000);
  });

  it("não conta transações de outro usuário", async () => {
    await seed({ userId: "user-1", type: "INCOME", value: 5000, date: new Date("2026-07-15") });
    await seed({ userId: "user-2", type: "INCOME", value: 9999, date: new Date("2026-07-15") });

    const { summary } = await sut.execute({ userId: "user-1", month: "2026-07" });

    expect(summary.balance).toBe(5000);
    expect(summary.income).toBe(5000);
  });

  it("sem month, income/expense caem para o histórico inteiro", async () => {
    await seed({ userId: "user-1", type: "INCOME", value: 1000, date: new Date("2026-06-10") });
    await seed({ userId: "user-1", type: "INCOME", value: 5000, date: new Date("2026-07-15") });

    const { summary } = await sut.execute({ userId: "user-1" });

    expect(summary.income).toBe(6000);
    expect(summary.expense).toBe(0);
  });

  it("retorna zeros quando o usuário não tem transações", async () => {
    const { summary } = await sut.execute({ userId: "user-1", month: "2026-07" });

    expect(summary).toEqual({ balance: 0, income: 0, expense: 0 });
  });
});
