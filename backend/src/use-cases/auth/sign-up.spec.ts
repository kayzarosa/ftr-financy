import { describe, expect, it } from "vitest";
import { InMemoryRefreshTokenRepository } from "@/domain/repositories/memory/in-memory-refresh-token-repository.js";
import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";
import { SignUpUseCase } from "./sign-up.js";

describe("SignUpUseCase", () => {
  it("must create a user with the encrypted password", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new SignUpUseCase(userRepository, refreshTokenRepository);

    const { user, accessToken, refreshToken } = await sut.execute({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).not.toEqual("123456");
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("It should not allow the creation of two users with the same email address.", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new SignUpUseCase(userRepository, refreshTokenRepository);

    await sut.execute({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    await expect(() =>
      sut.execute({
        name: "Kayza",
        email: "kayza@test.com",
        password: "outrasenha",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("must persist a refresh token linked to the created user", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new SignUpUseCase(userRepository, refreshTokenRepository);

    const { user, refreshToken } = await sut.execute({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    const stored = await refreshTokenRepository.findByToken(refreshToken);

    expect(stored).not.toBeNull();
    expect(stored?.userId).toEqual(user.id);
  });
});
