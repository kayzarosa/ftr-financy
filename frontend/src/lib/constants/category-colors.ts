export const categoryColors = [
  { value: "#16a34a", label: "Verde" },
  { value: "#2563eb", label: "Azul" },
  { value: "#9333ea", label: "Roxo" },
  { value: "#db2777", label: "Rosa" },
  { value: "#dc2626", label: "Vermelho" },
  { value: "#ea580c", label: "Laranja" },
  { value: "#ca8a04", label: "Amarelo" },
] as const;

export type CategoryColor = (typeof categoryColors)[number]["value"];

export const DEFAULT_CATEGORY_COLOR: CategoryColor = "#16a34a";
