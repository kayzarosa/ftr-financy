import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { ListCategoriesUseCase } from "./list-category.js";

describe("ListCategoriesUseCase", () => {
  let categoryRepository: InMemoryCategoryRepository;
  let listCategoriesUseCase: ListCategoriesUseCase;

  beforeEach(() => {
    categoryRepository = new InMemoryCategoryRepository();
    listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
  });

  it("should list only the categories owned by the given user", async () => {
    await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: null,
      description: null,
      icon: null,
    });
    await categoryRepository.create({
      name: "Lazer",
      userId: "21",
      color: "#3498db",
      description: null,
      icon: null,
    });
    await categoryRepository.create({
      name: "Outro usuário",
      userId: "99",
      color: null,
      description: null,
      icon: null,
    });

    const { categories } = await listCategoriesUseCase.execute({
      userId: "21",
    });

    expect(categories).toHaveLength(2);
    expect(categories.map((category) => category.name)).toEqual(
      expect.arrayContaining(["Compras", "Lazer"]),
    );
  });

  it("should return an empty list when the user has no categories", async () => {
    const { categories } = await listCategoriesUseCase.execute({
      userId: "sem-categorias",
    });

    expect(categories).toEqual([]);
  });
});
