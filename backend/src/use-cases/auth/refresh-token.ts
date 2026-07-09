import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "@/infra/crypto/jwt.js";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error.js";

type RefreshTokenUseCaseRequest = {
  refreshToken: string;
};

export class RefreshTokenUseCase {
  constructor(private usersRepository: IUserRepository) {}

  async execute({ refreshToken }: RefreshTokenUseCaseRequest) {
    let payload: ReturnType<typeof verifyToken>;

    try {
      payload = verifyToken(refreshToken);
    } catch {
      throw new InvalidCredentialsError();
    }

    if (payload.type !== "refresh") {
      throw new InvalidCredentialsError();
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const accessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    return { user, accessToken, refreshToken: newRefreshToken };
  }
}
