import { PrismaUserRepository } from "@/infra/database/prisma/repositories/prisma-user-repository.js";
import { UpdateUserUseCase } from "@/use-cases/user/update-user.js";

export function makeUpdateUserUseCase(): UpdateUserUseCase {
  const userRepository = new PrismaUserRepository();

  return new UpdateUserUseCase(userRepository);
}
