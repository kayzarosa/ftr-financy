import { graphql, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { DashboardPage } from "@/pages/DashboardPage";
import { server } from "@/test/msw-server";
import { renderWithProviders, screen } from "@/test/test-utils";

const api = graphql.link("http://localhost:3333/graphql");

const category = { id: "c1", name: "Alimentação", color: "#a855f7", icon: "ShoppingCart" };

function mockDashboard() {
  server.use(
    api.query("TransactionSummary", () =>
      HttpResponse.json({
        data: { transactionSummary: { balance: 124695, income: 355000, expense: 220305 } },
      }),
    ),
    api.query("RecentTransactions", () =>
      HttpResponse.json({
        data: {
          transactions: {
            items: [
              { id: "t1", name: "Sacolão", value: 67980, type: "EXPENSE", date: "2026-07-31T00:00:00.000Z", category },
              { id: "t2", name: "Leitura de taro", value: 10000, type: "INCOME", date: "2026-07-22T00:00:00.000Z", category: null },
            ],
            total: 2,
          },
        },
      }),
    ),
    api.query("CategorySpending", () =>
      HttpResponse.json({
        data: {
          categorySpending: [{ id: "c1", name: "Alimentação", color: "#a855f7", icon: "ShoppingCart", total: 161960, count: 4 }],
        },
      }),
    ),
  );
}

describe("DashboardPage", () => {
  it("mostra os três cards de resumo com os valores formatados", async () => {
    mockDashboard();
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("R$ 1.246,95")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.550,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 2.203,05")).toBeInTheDocument();
  });

  it("lista as transações recentes com o sinal certo de entrada/saída", async () => {
    mockDashboard();
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Sacolão")).toBeInTheDocument();
    expect(screen.getByText("- R$ 679,80")).toBeInTheDocument();

    expect(screen.getByText("Leitura de taro")).toBeInTheDocument();
    expect(screen.getByText("+ R$ 100,00")).toBeInTheDocument();
  });

  it("mostra os gastos por categoria com contagem e total", async () => {
    mockDashboard();
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("4 itens")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.619,60")).toBeInTheDocument();
  });
});
