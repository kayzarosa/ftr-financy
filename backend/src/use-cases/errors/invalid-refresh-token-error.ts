export class InvalidRefreshTokenError extends Error {
  constructor() {
    super("Token de atualização inválido ou expirado.");
    this.name = "InvalidRefreshTokenError";
  }
}
