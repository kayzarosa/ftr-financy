import type { IRefreshTokenRepository } from "@/domain/repositories/refresh-token-repository.js";

type LogoutUseCaseRequest = {
  refreshToken: string;
};

export class LogoutUseCase {
  constructor(private refreshTokenRepository: IRefreshTokenRepository) {}

  async execute({ refreshToken }: LogoutUseCaseRequest) {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }
}
