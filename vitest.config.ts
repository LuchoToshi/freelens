import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig's "@/*": ["./*"] path alias.
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    // Domain logic is pure and framework-free; a Node environment is enough.
    // Persistence tests that touch localStorage set up their own stub, so we
    // deliberately avoid pulling in a full DOM environment here.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
