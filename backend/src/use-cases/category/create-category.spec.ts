import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { CategoryAlreadyExistsError } from "../errors/category-already-exists-error.js";
import { CreateCategoryUseCase } from "./create-category.js";

describe("CreateCategoryUseCase", () => {
  let categoryRepository: InMemoryCategoryRepository;
  let createCategoryUseCase: CreateCategoryUseCase;

  beforeEach(() => {
    categoryRepository = new InMemoryCategoryRepository();
    createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
  });

  it("should be possible to create a category.", async () => {
    const { category } = await createCategoryUseCase.execute({
      name: "Compras",
      userId: "23",
      color: "#dd9939",
    });

    expect(category.id).toEqual(expect.any(String));
    expect(category.name).toEqual("Compras");
  });

  it("should not be possible to create a category with the same name.", async () => {
    await createCategoryUseCase.execute({
      name: "Compras",
      userId: "23",
    });

    await expect(() =>
      createCategoryUseCase.execute({
        name: "Compras",
        userId: "23",
        color: "#dd9939",
      }),
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError);
  });
});
