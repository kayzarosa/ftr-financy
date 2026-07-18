import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";
import { DeleteCategoryUseCase } from "./delete-category.js";

describe("DeleteCategoryUseCase", () => {
  let categoryRepository: InMemoryCategoryRepository;
  let deleteCategoryUseCase: DeleteCategoryUseCase;

  beforeEach(() => {
    categoryRepository = new InMemoryCategoryRepository();
    deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
  });

  it("should be possible to delete a category owned by the user", async () => {
    const category = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    await deleteCategoryUseCase.execute({ id: category.id, userId: "21" });

    const stillExists = await categoryRepository.findById(category.id);
    expect(stillExists).toBeNull();
  });

  it("should not be possible to delete a category that does not exist", async () => {
    await expect(() =>
      deleteCategoryUseCase.execute({ id: "not_exists", userId: "21" }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("should not be possible to delete a category owned by another user", async () => {
    const category = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });

    await expect(() =>
      deleteCategoryUseCase.execute({
        id: category.id,
        userId: "outro-usuario",
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    const stillExists = await categoryRepository.findById(category.id);
    expect(stillExists).not.toBeNull();
  });
});
