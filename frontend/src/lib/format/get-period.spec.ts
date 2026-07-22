import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPeriodOptions } from "@/lib/format/get-period";

describe("getPeriodOptions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-21T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa no mês atual", () => {
    const [current] = getPeriodOptions();
    expect(current).toEqual({ value: "2026-07", label: "Julho / 2026" });
  });

  it("volta para o mês anterior no índice seguinte", () => {
    const [, previous] = getPeriodOptions();
    expect(previous).toEqual({ value: "2026-06", label: "Junho / 2026" });
  });

  it("gera 24 opções por padrão", () => {
    expect(getPeriodOptions()).toHaveLength(24);
  });

  it("respeita o count informado", () => {
    expect(getPeriodOptions(3)).toHaveLength(3);
  });

  it("atravessa a virada de ano", () => {
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    const options = getPeriodOptions(2);
    expect(options[1]).toEqual({ value: "2025-12", label: "Dezembro / 2025" });
  });
});
