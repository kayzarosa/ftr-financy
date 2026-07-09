import { describe, expect, it } from "vitest";
import { InMemoryRefreshTokenRepository } from "@/domain/repositories/memory/in-memory-refresh-token-repository.js";
import { LogoutUseCase } from "./logout.js";

describe("LogoutUseCase", () => {
  it("must remove the refresh token from the repository", async () => {
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new LogoutUseCase(refreshTokenRepository);

    const refreshToken = await refreshTokenRepository.create({
      token: "some-refresh-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
    });

    await sut.execute({ refreshToken: refreshToken.token });

    const stillExists = await refreshTokenRepository.findByToken(refreshToken.token);
    expect(stillExists).toBeNull();
  });

  it("must not throw when the refresh token does not exist", async () => {
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const sut = new LogoutUseCase(refreshTokenRepository);

    await expect(sut.execute({ refreshToken: "inexistente" })).resolves.not.toThrow();
  });
});
