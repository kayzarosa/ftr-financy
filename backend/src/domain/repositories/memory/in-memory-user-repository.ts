import type { User } from "@/domain/entities/user.js";
import type { IUserRepository } from "../user-repository.js";
import { randomUUID } from "node:crypto";

export class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const user: User = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
