import { UpdateUserUseCase } from "@/use-cases/user/update-user.js";
import { PrismaUserRepository } from "../database/prisma/repositories/prisma-user-repository.js";

export function makeUpdateUserUseCase(): UpdateUserUseCase {
  const userRepository = new PrismaUserRepository();

  return new UpdateUserUseCase(userRepository);
}
