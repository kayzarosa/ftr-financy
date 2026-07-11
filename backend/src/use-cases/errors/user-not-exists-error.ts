export class UserNotExistsError extends Error {
  constructor() {
    super("Usuário não existe.");
    this.name = "UserNotExistsError";
  }
}
