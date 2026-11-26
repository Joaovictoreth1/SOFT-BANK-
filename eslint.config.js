import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  { files: ["src/js/**/*.js"], languageOptions: { globals: globals.browser } },
  { files: ["*.js"], languageOptions: { globals: globals.node } },
  {
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
