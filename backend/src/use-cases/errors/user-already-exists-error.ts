export class UserAlreadyExistsError extends Error {
  constructor() {
    super("Usuário com esse e-mail já existe.");
    this.name = "UserAlreadyExistsError";
  }
}