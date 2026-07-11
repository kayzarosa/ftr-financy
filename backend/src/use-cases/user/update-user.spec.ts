import { InMemoryUserRepository } from "@/domain/repositories/memory/in-memory-user-repository.js";
import { beforeEach, describe, expect, it } from "vitest";
import { UpdateUserUseCase } from "./update-user.js";
import { UserAlreadyExistsError } from "../errors/user-already-exists-error.js";
import { UserNotExistsError } from "../errors/user-not-exists-error.js";

describe("UpdateUserUseCase", () => {
  let userRepository: InMemoryUserRepository;
  let updateUserUseCase: UpdateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();

    updateUserUseCase = new UpdateUserUseCase(
      userRepository,
    );
  });
  it("must be possible to successfully change the user", async () => {
    const user1 = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    expect(user1.id).toEqual(expect.any(String));
    expect(user1.password).toEqual("123456");

    await updateUserUseCase.execute({
      id: user1.id,
      name: "Kayza Novais",
      email: "kayzarosa@test.com",
    });

    const updateUser1 = await userRepository.findById(user1.id);
    expect(updateUser1?.name).toEqual("Kayza Novais");
    expect(updateUser1?.email).toEqual("kayzarosa@test.com");
  });

  it("should not be possible to change a user with a registered email to another user.", async () => {
    const user1 = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    expect(user1.id).toEqual(expect.any(String));
    expect(user1.password).toEqual("123456");

    const user2 = await userRepository.create({
      name: "Kayza",
      email: "kayza2@test.com",
      password: "123456",
    });

    expect(user2.id).toEqual(expect.any(String));
    expect(user2.password).toEqual("123456");

    await expect(() =>
      updateUserUseCase.execute({
        id: user1.id,
        name: "Kayza Novais",
        email: "kayza2@test.com",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("should not be possible to modify a user that does not exist.", async () => {
    await expect(() =>
      updateUserUseCase.execute({
        id: "user_not_exists",
        name: "Kayza Novais",
        email: "kayza2@test.com",
      }),
    ).rejects.toBeInstanceOf(UserNotExistsError);
  });

  it("must update only the name, without checking email uniqueness", async () => {
    const user = await userRepository.create({
      name: "Kayza",
      email: "kayza@test.com",
      password: "123456",
    });

    await updateUserUseCase.execute({ id: user.id, name: "Kayza Rosa" });

    const updated = await userRepository.findById(user.id);
    expect(updated?.name).toEqual("Kayza Rosa");
    expect(updated?.email).toEqual("kayza@test.com");
  });
});
