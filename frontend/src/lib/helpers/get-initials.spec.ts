import { describe, expect, it } from "vitest";
import { getInitials } from "@/lib/helpers/get-initials";

describe("getInitials", () => {
  it("usa a primeira e a última palavra", () => {
    expect(getInitials("Kayza Silva")).toBe("KS");
  });

  it("pega três nomes ignorando o do meio", () => {
    expect(getInitials("ana beatriz costa")).toBe("AC");
  });

  it("retorna só uma inicial para nome único", () => {
    expect(getInitials("Kayza")).toBe("K");
  });

  it("ignora espaços extras entre as palavras", () => {
    expect(getInitials("  Ana  Maria  ")).toBe("AM");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(getInitials("")).toBe("");
  });
});
