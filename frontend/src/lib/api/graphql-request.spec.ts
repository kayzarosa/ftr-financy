import { ClientError } from "graphql-request";
import { delay, graphql, type GraphQLResponseResolver, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { request } from "@/lib/api/graphql-request";
import { server } from "@/test/msw-server";
import { useAuthStore } from "@/stores/auth-store";

const api = graphql.link("http://localhost:3333/graphql");
const ME = "query Me { me { id } }";
const user = { id: "u1", name: "Kayza", email: "kayza@financy.dev" };

type MeQuery = { me: { id: string } };
type RefreshMutation = {
  refreshToken: { accessToken: string; refreshToken: string; user: typeof user };
};

const unauthenticated: GraphQLResponseResolver<MeQuery> = () =>
  HttpResponse.json({
    errors: [{ message: "Sessão expirada", extensions: { code: "UNAUTHENTICATED" } }],
  });

const meByToken: GraphQLResponseResolver<MeQuery> = (info) => {
  const isFresh = info.request.headers.get("authorization") === "Bearer new-access";
  return isFresh ? HttpResponse.json({ data: { me: { id: "u1" } } }) : unauthenticated(info);
};

function refreshHandler(
  counter: { calls: number },
  delayMs = 0,
): GraphQLResponseResolver<RefreshMutation> {
  return async () => {
    counter.calls += 1;
    if (delayMs) await delay(delayMs);
    return HttpResponse.json({
      data: { refreshToken: { accessToken: "new-access", refreshToken: "new-refresh", user } },
    });
  };
}

beforeEach(() => {
  useAuthStore.setState({ accessToken: "old-access", refreshToken: "old-refresh", user });
});

describe("request", () => {
  it("passa direto quando a request tem sucesso, sem refresh", async () => {
    const refresh = { calls: 0 };
    server.use(
      api.query("Me", () => HttpResponse.json({ data: { me: { id: "u1" } } })),
      api.mutation("RefreshToken", refreshHandler(refresh)),
    );

    const data = await request<{ me: { id: string } }>(ME);

    expect(data).toEqual({ me: { id: "u1" } });
    expect(refresh.calls).toBe(0);
  });

  it("faz refresh uma vez, salva o par novo e re-tenta ao receber UNAUTHENTICATED", async () => {
    const refresh = { calls: 0 };
    server.use(api.query("Me", meByToken), api.mutation("RefreshToken", refreshHandler(refresh)));

    const data = await request<{ me: { id: string } }>(ME);

    expect(data).toEqual({ me: { id: "u1" } });
    expect(refresh.calls).toBe(1);
    expect(useAuthStore.getState().accessToken).toBe("new-access");
    expect(useAuthStore.getState().refreshToken).toBe("new-refresh");
  });

  it("dispara um único refresh para várias requests concorrentes", async () => {
    const refresh = { calls: 0 };
    server.use(api.query("Me", meByToken), api.mutation("RefreshToken", refreshHandler(refresh, 20)));

    const results = await Promise.all([
      request<{ me: { id: string } }>(ME),
      request<{ me: { id: string } }>(ME),
      request<{ me: { id: string } }>(ME),
    ]);

    expect(results).toEqual([{ me: { id: "u1" } }, { me: { id: "u1" } }, { me: { id: "u1" } }]);
    expect(refresh.calls).toBe(1);
  });

  it("desloga e propaga o erro quando não há refresh token", async () => {
    useAuthStore.setState({ accessToken: "old-access", refreshToken: null, user });
    server.use(api.query("Me", unauthenticated));

    await expect(request(ME)).rejects.toBeInstanceOf(ClientError);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
