import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: ({ accessToken, refreshToken, user }) => set({ accessToken, refreshToken, user }),
      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : state.user,
        })),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "financy-auth" },
  ),
);
