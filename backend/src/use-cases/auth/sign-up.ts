import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";
import { hashPassword } from "@/infra/crypto/hash.js";
import { signAccessToken, signRefreshToken } from "@/infra/crypto/jwt.js";

type SignUpUseCaseRequest = {
  name: string;
  email: string;
  password: string;
};

export class SignUpUseCase {
  constructor(private userRepository: IUserRepository) {}

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
    const refreshToken = signRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }
}
