import { SignInUseCase } from "@/use-cases/auth/sign-in.js";
import { PrismaRefreshTokenRepository } from "../database/prisma/repositories/prisma-refresh-token-repository.js";
import { PrismaUserRepository } from "../database/prisma/repositories/prisma-user-repository.js";

export function makeSignInUseCase(): SignInUseCase {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new SignInUseCase(userRepository, refreshTokenRepository);
}
