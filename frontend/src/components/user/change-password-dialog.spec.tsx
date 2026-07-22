import { graphql, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ChangePasswordDialog } from "@/components/user/change-password-dialog";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";
import { server } from "@/test/msw-server";

const api = graphql.link("http://localhost:3333/graphql");

function submitButton() {
  return screen.getByRole("button", { name: /salvar nova senha/i });
}

describe("ChangePasswordDialog", () => {
  it("mostra os erros de validação ao submeter vazio", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordDialog open onOpenChange={vi.fn()} />);

    await user.click(submitButton());

    expect(await screen.findByText("Senha atual é obrigatória")).toBeInTheDocument();
    expect(screen.getByText("Nova senha deve ter no mínimo 8 caracteres")).toBeInTheDocument();
    expect(screen.getByText("Confirme a nova senha")).toBeInTheDocument();
  });

  it("acusa quando a confirmação não coincide com a nova senha", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordDialog open onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText("Senha atual"), "senha-atual");
    await user.type(screen.getByLabelText("Nova senha"), "novaSenha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "outraCoisa999");
    await user.click(submitButton());

    expect(await screen.findByText("As senhas não coincidem")).toBeInTheDocument();
  });

  it("envia a mutation e fecha o dialog no sucesso", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    let received: unknown;

    server.use(
      api.mutation("UpdatePassword", ({ variables }) => {
        received = variables;
        return HttpResponse.json({ data: { updatePassword: true } });
      }),
    );

    renderWithProviders(<ChangePasswordDialog open onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText("Senha atual"), "senha-atual");
    await user.type(screen.getByLabelText("Nova senha"), "novaSenha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "novaSenha123");
    await user.click(submitButton());

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(received).toEqual({ oldPassword: "senha-atual", newPassword: "novaSenha123" });
  });
});
