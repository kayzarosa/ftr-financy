import { describe, expect, it } from "vitest";
import { InMemoryRefreshTokenRepository } from "@/domain/repositories/memory/in-memory-refresh-token-repository.js";
import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { hashPassword } from "@/infra/crypto/hash.js";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error.js";
import { RefreshTokenUseCase } from "./refresh-token.js";

describe("RefreshTokenUseCase", () => {
  it("must issue a new token pair and rotate the refresh token", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new RefreshTokenUseCase(userRepository, refreshTokenRepository);

    const user = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    const oldRefreshToken = await refreshTokenRepository.create({
      token: "old-refresh-token",
      userId: user.id,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const { accessToken, refreshToken } = await sut.execute({
      refreshToken: oldRefreshToken.token,
    });

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
    expect(refreshToken).not.toEqual(oldRefreshToken.token);

    const stillExists = await refreshTokenRepository.findByToken(
      oldRefreshToken.token,
    );
    expect(stillExists).toBeNull();
  });

  it("must reject a refresh token that does not exist", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new RefreshTokenUseCase(userRepository, refreshTokenRepository);

    await expect(() =>
      sut.execute({ refreshToken: "token-que-nao-existe" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("must reject and delete an expired refresh token", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new RefreshTokenUseCase(userRepository, refreshTokenRepository);

    const user = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    const expiredToken = await refreshTokenRepository.create({
      token: "expired-token",
      userId: user.id,
      expiresAt: new Date(Date.now() - 1_000),
    });

    await expect(() =>
      sut.execute({ refreshToken: expiredToken.token }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    const stillExists = await refreshTokenRepository.findByToken(
      expiredToken.token,
    );
    expect(stillExists).toBeNull();
  });

  it("must reject a refresh token whose user no longer exists", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new RefreshTokenUseCase(userRepository, refreshTokenRepository);

    const orphanToken = await refreshTokenRepository.create({
      token: "token-de-usuario-inexistente",
      userId: "id-que-nunca-existiu",
      expiresAt: new Date(Date.now() + 60_000), // válido, não expirado
    });

    await expect(() =>
      sut.execute({ refreshToken: orphanToken.token }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
