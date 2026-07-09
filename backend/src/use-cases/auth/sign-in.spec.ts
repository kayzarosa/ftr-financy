import { describe, expect, it } from "vitest";
import { InMemoryRefreshTokenRepository } from "@/domain/repositories/memory/in-memory-refresh-token-repository.js";
import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { hashPassword } from "@/infra/crypto/hash.js";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error.js";
import { SignInUseCase } from "./sign-in.js";

describe("SignInUseCase", () => {
  it("must authenticate an existing user with the correct password", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new SignInUseCase(userRepository, refreshTokenRepository);

    await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    const { user, accessToken, refreshToken } = await sut.execute({
      email: "kayza@test.com",
      password: "123456",
    });

    expect(user.email).toEqual("kayza@test.com");
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("must not authenticate when the email does not exist", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new SignInUseCase(userRepository, refreshTokenRepository);

    await expect(() =>
      sut.execute({
        email: "nao-existe@test.com",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("must not authenticate with the wrong password", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new SignInUseCase(userRepository, refreshTokenRepository);

    await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    await expect(() =>
      sut.execute({
        email: "kayza@test.com",
        password: "senha-errada",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
