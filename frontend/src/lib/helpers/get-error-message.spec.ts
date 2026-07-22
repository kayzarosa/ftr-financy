import { ClientError } from "graphql-request";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/lib/helpers/get-error-message";

function makeClientError(errors?: { message: string }[]) {
  return new ClientError(
    { errors, status: 200, headers: new Headers() } as ConstructorParameters<typeof ClientError>[0],
    { query: "mutation {}" },
  );
}

describe("getErrorMessage", () => {
  it("extrai a mensagem do primeiro erro do ClientError", () => {
    const error = makeClientError([{ message: "Categoria já existe" }]);
    expect(getErrorMessage(error)).toBe("Categoria já existe");
  });

  it("cai no fallback quando o ClientError não traz erros", () => {
    const error = makeClientError();
    expect(getErrorMessage(error)).toBe("Algo deu errado. Tente novamente.");
  });

  it("cai no fallback para um erro que não é ClientError", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("Algo deu errado. Tente novamente.");
  });

  it("respeita um fallback customizado", () => {
    expect(getErrorMessage("erro qualquer", "Falhou ao salvar")).toBe("Falhou ao salvar");
  });
});
