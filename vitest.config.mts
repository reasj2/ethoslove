import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
  resolve: {
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
});
