import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRefreshTokenRepository } from "@/domain/repositories/memory/in-memory-refresh-token-repository.js";
import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { hashPassword } from "@/infra/crypto/hash.js";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error.js";
import { SignInUseCase } from "./sign-in.js";

describe("SignInUseCase", () => {
  let userRepository: InMemoryUserRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let signInUseCase: SignInUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    signInUseCase = new SignInUseCase(userRepository, refreshTokenRepository);
  });

  it("must authenticate an existing user with the correct password", async () => {
    await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    const { user, accessToken, refreshToken } = await signInUseCase.execute({
      email: "kayza@test.com",
      password: "123456",
    });

    expect(user.email).toEqual("kayza@test.com");
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("must not authenticate when the email does not exist", async () => {
    await expect(() =>
      signInUseCase.execute({
        email: "nao-existe@test.com",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("must not authenticate with the wrong password", async () => {
    await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    await expect(() =>
      signInUseCase.execute({
        email: "kayza@test.com",
        password: "senha-errada",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
