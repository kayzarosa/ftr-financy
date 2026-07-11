import type { IRefreshTokenRepository } from "@/domain/repositories/refresh-token-repository.js";
import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { comparePassword, hashPassword } from "@/infra/crypto/hash.js";
import { InvalidOldPasswordError } from "../errors/invalid-old-password-error.js";
import { UserNotExistsError } from "../errors/user-not-exists-error.js";

type UpdatePasswordRequest = {
  id: string;
  oldPassword: string;
  newPassword: string;
};

export class UpdatePasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ id, newPassword, oldPassword }: UpdatePasswordRequest) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotExistsError();
    }

    const passwordMatches = await comparePassword(oldPassword, user.password);

    if (!passwordMatches) {
      throw new InvalidOldPasswordError();
    }

    const newPasswordHash = await hashPassword(newPassword);

    await this.userRepository.update(id, { password: newPasswordHash });

    await this.refreshTokenRepository.deleteAllByUserId(user.id);
  }
}
