export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super("Você já tem uma categoria com esse nome.");
    this.name = "CategoryAlreadyExistsError";
  }
}
