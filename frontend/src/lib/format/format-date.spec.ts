import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate } from "@/lib/format/format-date";

describe("formatDate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("formata a data em dd/mm/aa", () => {
    expect(formatDate("2026-07-21")).toBe("21/07/26");
  });

  it("aplica zero-pad em dia e mês", () => {
    expect(formatDate("2026-01-05")).toBe("05/01/26");
  });

  it("usa UTC independente do fuso da máquina", () => {
    vi.stubEnv("TZ", "America/Sao_Paulo");
    expect(formatDate("2026-07-21")).toBe("21/07/26");
  });
});
