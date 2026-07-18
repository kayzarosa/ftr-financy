import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { CategoryAlreadyExistsError } from "../errors/category-already-exists-error.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";
import { UpdateCategoryUseCase } from "./update-category.js";

describe("UpdateCategoryUseCase", () => {
  let categoryRepository: InMemoryCategoryRepository;
  let updateCategoryUseCase: UpdateCategoryUseCase;

  beforeEach(() => {
    categoryRepository = new InMemoryCategoryRepository();
    updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
  });

  it("should be possible to change a category.", async () => {
    const category = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    expect(category.id).toEqual(expect.any(String));
    expect(category.name).toEqual("Compras");

    const { category: updatedCategory } = await updateCategoryUseCase.execute({
      id: category.id,
      userId: category.userId,
      name: "Compra Mercado",
      color: "#909f23",
    });

    expect(updatedCategory.id).toEqual(expect.any(String));
    expect(updatedCategory.name).toEqual("Compra Mercado");
    expect(updatedCategory.color).toEqual("#909f23");
  });

  it("shouldn't be possible to change a category that doesn't exist.", async () => {
    await expect(() =>
      updateCategoryUseCase.execute({
        id: "not_exists",
        userId: "not_exists",
        name: "Compras",
        color: "#909f23",
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("should not be possible to register a category with the same name for the same user.", async () => {
    const category = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    const category2 = await categoryRepository.create({
      name: "Compras1",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    expect(category.id).toEqual(expect.any(String));
    expect(category.name).toEqual("Compras");

    await expect(() =>
      updateCategoryUseCase.execute({
        id: category2.id,
        userId: category2.userId,
        name: "Compras",
        color: "#909f23",
      }),
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError);
  });

  it("shouldn't be possible to change a category owned by another user.", async () => {
    const category = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    await expect(() =>
      updateCategoryUseCase.execute({
        id: category.id,
        userId: "outro-usuario",
        name: "Nome Trocado",
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    const stillSame = await categoryRepository.findById(category.id);
    expect(stillSame?.name).toEqual("Compras");
  });

  it("should be possible to change only the color, without checking name uniqueness.", async () => {
    const category = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    const { category: updatedCategory } = await updateCategoryUseCase.execute({
      id: category.id,
      userId: category.userId,
      color: "#909f23",
    });

    expect(updatedCategory.name).toEqual("Compras");
    expect(updatedCategory.color).toEqual("#909f23");
  });
});
