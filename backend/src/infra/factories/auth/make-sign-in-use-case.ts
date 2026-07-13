import { PrismaRefreshTokenRepository } from "@/infra/database/prisma/repositories/prisma-refresh-token-repository.js";
import { PrismaUserRepository } from "@/infra/database/prisma/repositories/prisma-user-repository.js";
import { SignInUseCase } from "@/use-cases/auth/sign-in.js";

export function makeSignInUseCase(): SignInUseCase {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new SignInUseCase(userRepository, refreshTokenRepository);
}
