import type { IRefreshTokenRepository } from "@/domain/repositories/refresh-token-repository.js";
import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { hashPassword } from "@/infra/crypto/hash.js";
import { REFRESH_TOKEN_TTL_MS, signAccessToken } from "@/infra/crypto/jwt.js";
import { generateRefreshToken } from "@/infra/crypto/refresh-token.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";

type SignUpUseCaseRequest = {
  name: string;
  email: string;
  password: string;
};

export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ name, email, password }: SignUpUseCaseRequest) {
    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = await hashPassword(password);

    const user = await this.userRepository.create({
      name,
      email,
      password: passwordHash,
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = await this.refreshTokenRepository.create({
      token: generateRefreshToken(),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { user, accessToken, refreshToken: refreshToken.token };
  }
}
