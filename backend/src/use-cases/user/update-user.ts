import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { UserAlreadyExistsError } from "../errors/user-already-exists-error.js";
import { UserNotExistsError } from "../errors/user-not-exists-error.js";

type UpdateUserUseCaseRequest = {
  id: string;
  name?: string;
  email?: string;
};

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ id, email, name }: UpdateUserUseCaseRequest) {
    if (email) {
      const userWithSameEmail = await this.userRepository.findByEmail(email);

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new UserAlreadyExistsError();
      }
    }

    const userExists = await this.userRepository.findById(id);

    if (!userExists) {
      throw new UserNotExistsError();
    }

    const userUpdated = await this.userRepository.update(id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    });

    return { userUpdated };
  }
}
