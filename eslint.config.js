
import globals from "globals";

export default [
  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "no-undef": "error",

      "no-console": "warn",
    },
  },

  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      ".vite/**",
    ],
  },
];
