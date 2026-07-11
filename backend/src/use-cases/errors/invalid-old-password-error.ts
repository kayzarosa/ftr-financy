export class InvalidOldPasswordError extends Error {
  constructor() {
    super("Senha antiga não corresponde");
    this.name = "InvalidOldPasswordError";
  }
}
