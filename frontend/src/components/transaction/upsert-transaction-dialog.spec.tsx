import { graphql, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  type Transaction,
  UpSertTransactionDialog,
} from "@/components/transaction/upsert-transaction-dialog";
import { server } from "@/test/msw-server";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/test-utils";

const api = graphql.link("http://localhost:3333/graphql");

function saveButton() {
  return screen.getByRole("button", { name: /^salvar$/i });
}

beforeEach(() => {
  server.use(api.query("Categories", () => HttpResponse.json({ data: { categories: [] } })));
});

describe("UpSertTransactionDialog", () => {
  it("mostra os erros de validação ao submeter vazio", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UpSertTransactionDialog open onOpenChange={vi.fn()} />);

    await user.click(saveButton());

    expect(await screen.findByText("Descrição é obrigatória")).toBeInTheDocument();
    expect(screen.getByText("Informe um valor")).toBeInTheDocument();
    expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
  });

  it("converte o valor digitado para centavos ao criar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    let received: Record<string, unknown> | undefined;

    server.use(
      api.mutation("CreateTransaction", ({ variables }) => {
        received = variables;
        return HttpResponse.json({ data: { createTransaction: { id: "t1" } } });
      }),
    );

    renderWithProviders(<UpSertTransactionDialog open onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText("Descrição"), "Almoço");
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-07-21" } });
    await user.type(screen.getByLabelText("Valor"), "12345");

    expect((screen.getByLabelText("Valor") as HTMLInputElement).value.replace(/ | /g, " ")).toBe(
      "R$ 123,45",
    );

    await user.click(saveButton());

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(received).toMatchObject({
      name: "Almoço",
      type: "EXPENSE",
      value: 12345,
      date: "2026-07-21",
    });
  });

  it("preenche a partir dos centavos e atualiza com o id ao editar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    let received: Record<string, unknown> | undefined;

    const transaction: Transaction = {
      id: "t-42",
      name: "Salário",
      value: 500000,
      type: "INCOME",
      date: "2026-07-01T00:00:00.000Z",
      category: null,
    };

    server.use(
      api.mutation("UpdateTransaction", ({ variables }) => {
        received = variables;
        return HttpResponse.json({ data: { updateTransaction: { id: "t-42" } } });
      }),
    );

    renderWithProviders(
      <UpSertTransactionDialog open onOpenChange={onOpenChange} transaction={transaction} />,
    );

    expect((screen.getByLabelText("Valor") as HTMLInputElement).value.replace(/ | /g, " ")).toBe(
      "R$ 5.000,00",
    );

    await user.click(saveButton());

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(received).toMatchObject({
      id: "t-42",
      name: "Salário",
      type: "INCOME",
      value: 500000,
      date: "2026-07-01",
    });
  });
});
