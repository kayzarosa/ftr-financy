import type { IRefreshTokenRepository } from "@/domain/repositories/refresh-token-repository.js";
import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { comparePassword } from "@/infra/crypto/hash.js";
import { REFRESH_TOKEN_TTL_MS, signAccessToken } from "@/infra/crypto/jwt.js";
import { generateRefreshToken } from "@/infra/crypto/refresh-token.js";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error.js";

type SignInUseCaseRequest = {
  email: string;
  password: string;
};

export class SignInUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ email, password }: SignInUseCaseRequest) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = await this.refreshTokenRepository.create({
      token: generateRefreshToken(),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { user, accessToken, refreshToken: refreshToken.token };
  }
}
