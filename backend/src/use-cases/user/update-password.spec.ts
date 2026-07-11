import { InMemoryRefreshTokenRepository } from "@/domain/repositories/memory/in-memory-refresh-token-repository.js";
import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { beforeEach, describe, expect, it } from "vitest";
import { UpdatePasswordUseCase } from "./update-password.js";
import { hashPassword } from "@/infra/crypto/hash.js";
import { UserNotExistsError } from "../errors/user-not-exists-error.js";
import { InvalidOldPasswordError } from "../errors/invalid-old-password-error.js";

describe("UpdatePasswordUseCase", () => {
  let userRepository: InMemoryUserRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let updatePasswordUseCase: UpdatePasswordUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();

    updatePasswordUseCase = new UpdatePasswordUseCase(
      userRepository,
      refreshTokenRepository,
    );
  });

  it("should succeed in changing the password", async () => {
    const user = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).not.toEqual("123456");

    const refreshToken = await refreshTokenRepository.create({
      token: "algum-refresh-token",
      userId: user.id,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await updatePasswordUseCase.execute({
      id: user.id,
      oldPassword: "123456",
      newPassword: "nova-senha",
    });

    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser?.password).not.toEqual(user.password);

    const tokenStillExists = await refreshTokenRepository.findByToken(
      refreshToken.token,
    );
    expect(tokenStillExists).toBeNull();
  });

  it("It should return a user does not exist error.", async () => {
    await expect(() =>
      updatePasswordUseCase.execute({
        id: "user-not-found",
        oldPassword: "12345",
        newPassword: "34534",
      }),
    ).rejects.toBeInstanceOf(UserNotExistsError);
  });

  it("must validate and verify that the old password is not the same as the one provided", async () => {
    const user = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: await hashPassword("123456"),
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).not.toEqual("123456");

    await expect(() =>
      updatePasswordUseCase.execute({
        id: user.id,
        oldPassword: "12345",
        newPassword: "34534",
      }),
    ).rejects.toBeInstanceOf(InvalidOldPasswordError);
  });
});
