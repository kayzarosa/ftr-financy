import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "src/generated/**",
        "**/*.spec.ts",
        "src/infra/http/**",
        "src/domain/repositories/memory/**",
        "src/infra/env/**",
        "src/infra/database/prisma/**",
        "src/infra/factories/**",
      ],
    },
  },
});
