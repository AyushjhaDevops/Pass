import { defineConfig } from "vite";

export default defineConfig({
  base: "/pass-tool/",

  test: {
    globals: true,
    environment: "jsdom",

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: [
        "node_modules/",
        "dist/",
        "public/",
        "tests/",
        "**/*.config.js",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});