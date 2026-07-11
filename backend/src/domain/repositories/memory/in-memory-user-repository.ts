import { randomUUID } from "node:crypto";
import type { User } from "@/domain/entities/user.js";
import type { IUserRepository } from "../user-repository.js";

export class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.users.push(user);

    return user;
  }

  async update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "password">>,
  ): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    const existingUser = this.users[userIndex];

    if (!existingUser) {
      throw new Error("User not Exists");
    }

    const updateUser: User = {
      ...existingUser,
      ...data,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updateUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
