import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Ratchet, not a target (issue #28). These are the numbers this suite
      // actually reaches on a clean checkout, floored to one decimal so the gate
      // cannot drift on a rounding difference: raise them as coverage improves.
      // Re-measure with 'npm run test:coverage' before changing them.
      thresholds: {
        lines: 28,
        functions: 41,
        branches: 65,
        statements: 28,
      },
      exclude: [
        "node_modules/",
        "src/test/",
        // Entry point: mounts the app, no logic of its own to cover.
        "src/main.tsx",
        // Declarations and type-only modules: no executable code.
        "**/*.d.ts",
        "src/types/",
        // Test code, in every shape this repo has it.
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "tests/",
        // Tooling and stories: dev-only, never shipped.
        "**/*.config.{js,ts}",
        "**/*.stories.{ts,tsx}",
      ],
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
