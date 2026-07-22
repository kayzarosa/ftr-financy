import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

const user = { id: "user-1", name: "Kayza", email: "kayza@financy.dev" };

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, refreshToken: null, user: null });
});

describe("useAuthStore", () => {
  it("popula o trio de auth no setAuth", () => {
    useAuthStore.getState().setAuth({ accessToken: "access", refreshToken: "refresh", user });

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "access",
      refreshToken: "refresh",
      user,
    });
  });

  it("aplica patch parcial no user existente", () => {
    useAuthStore.getState().setAuth({ accessToken: "access", refreshToken: "refresh", user });

    useAuthStore.getState().updateUser({ name: "Kayza Silva" });

    expect(useAuthStore.getState().user).toEqual({ ...user, name: "Kayza Silva" });
  });

  it("não cria user quando não há sessão", () => {
    useAuthStore.getState().updateUser({ name: "Fantasma" });

    expect(useAuthStore.getState().user).toBeNull();
  });

  it("limpa o trio no logout", () => {
    useAuthStore.getState().setAuth({ accessToken: "access", refreshToken: "refresh", user });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  });
});
