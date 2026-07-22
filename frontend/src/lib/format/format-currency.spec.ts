import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format/format-currency";

const norm = (value: string) => value.replace(/ | /g, " ");

describe("formatCurrency", () => {
  it("converte centavos em reais", () => {
    expect(norm(formatCurrency(1000))).toBe("R$ 10,00");
  });

  it("preserva os centavos na conversão", () => {
    expect(norm(formatCurrency(12345))).toBe("R$ 123,45");
  });

  it("formata zero", () => {
    expect(norm(formatCurrency(0))).toBe("R$ 0,00");
  });
});
