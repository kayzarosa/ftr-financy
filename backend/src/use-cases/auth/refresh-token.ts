import type { IRefreshTokenRepository } from "@/domain/repositories/refresh-token-repository.js";
import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { REFRESH_TOKEN_TTL_MS, signAccessToken } from "@/infra/crypto/jwt.js";
import { generateRefreshToken } from "@/infra/crypto/refresh-token.js";
import { InvalidRefreshTokenError } from "@/use-cases/errors/invalid-refresh-token-error.js";

type RefreshTokenUseCaseRequest = {
  refreshToken: string;
};

export class RefreshTokenUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ refreshToken }: RefreshTokenUseCaseRequest) {
    const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new InvalidRefreshTokenError();
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete(storedToken.id);
      throw new InvalidRefreshTokenError();
    }

    const user = await this.usersRepository.findById(storedToken.userId);

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    await this.refreshTokenRepository.delete(storedToken.id);

    const newRefreshToken = await this.refreshTokenRepository.create({
      token: generateRefreshToken(),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    const accessToken = signAccessToken(user.id);

    return { user, accessToken, refreshToken: newRefreshToken.token };
  }
}
