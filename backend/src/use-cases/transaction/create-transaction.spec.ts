import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";
import { UserNotExistsError } from "../errors/user-not-exists-error.js";
import { CreateTransactionUseCase } from "./create-transaction.js";

describe("CreateTransactionUseCase", () => {
  let userRepository: InMemoryUserRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let createTransactionUseCase: CreateTransactionUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    categoryRepository = new InMemoryCategoryRepository();
    transactionRepository = new InMemoryTransactionRepository();

    createTransactionUseCase = new CreateTransactionUseCase(
      transactionRepository,
      userRepository,
      categoryRepository,
    );
  });

  it("should be possible to create a new transaction", async () => {
    const user = await userRepository.create({
      email: "teste@test.com",
      name: "Teste",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).toEqual("123456");

    const category = await categoryRepository.create({
      name: "Compras",
      color: "#091345",
      description: null,
      icon: null,
      userId: user.id,
    });

    expect(category.id).toEqual(expect.any(String));
    expect(category.name).toEqual("Compras");

    const { transaction } = await createTransactionUseCase.execute({
      name: "Mercado",
      date: new Date("2026-07-12"),
      categoryId: category.id,
      type: "EXPENSE",
      userId: user.id,
      value: 134,
    });

    expect(transaction.id).toEqual(expect.any(String));
    expect(transaction.name).toEqual("Mercado");
    expect(transaction.categoryId).toEqual(category.id);
    expect(transaction.type).toEqual("EXPENSE");
    expect(transaction.userId).toEqual(user.id);
  });

  it("should not be possible to register a transaction for a user that does not exist.", async () => {
    await expect(() =>
      createTransactionUseCase.execute({
        name: "Mercado",
        date: new Date("2026-07-12"),
        categoryId: "1",
        type: "EXPENSE",
        userId: "user_not_exists",
        value: 134,
      }),
    ).rejects.toBeInstanceOf(UserNotExistsError);
  });

  it("should not be possible to register a transaction for a category that does not exist.", async () => {
    const user = await userRepository.create({
      email: "teste@test.com",
      name: "Teste",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).toEqual("123456");

    await expect(() =>
      createTransactionUseCase.execute({
        name: "Mercado",
        date: new Date("2026-07-12"),
        categoryId: "not_exists",
        type: "EXPENSE",
        userId: user.id,
        value: 134,
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("should be possible to register a transaction without a category.", async () => {
    const user = await userRepository.create({
      email: "teste@test.com",
      name: "Teste",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).toEqual("123456");

    const { transaction } = await createTransactionUseCase.execute({
      name: "Mercado",
      date: new Date("2026-07-12"),
      categoryId: null,
      type: "EXPENSE",
      userId: user.id,
      value: 134,
    });

    expect(transaction.id).toEqual(expect.any(String));
    expect(transaction.name).toEqual("Mercado");
    expect(transaction.categoryId).toBeNull();
    expect(transaction.type).toEqual("EXPENSE");
    expect(transaction.userId).toEqual(user.id);
  });
});
