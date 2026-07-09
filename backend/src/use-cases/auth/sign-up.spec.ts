import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { describe, expect, it } from "vitest";
import { SignUpUseCase } from "./sign-up.js";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error.js";

describe("SingUpUseCase", () => {
  it("must create a user with the encrypted password", async () => {
    const userRepository = new InMemoryUserRepository();
    const sut = new SignUpUseCase(userRepository);

    const { user } = await sut.execute({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.password).not.toEqual("123456");
  });

  it("It should not allow the creation of two users with the same email address.", async () => {
    const userRepository = new InMemoryUserRepository();
    const sut = new SignUpUseCase(userRepository);

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
});
