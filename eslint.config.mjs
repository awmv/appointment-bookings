import eslintPluginVue from "eslint-plugin-vue";
import eslintPluginPrettier from "eslint-plugin-prettier";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["node_modules/**", ".meteor/**", "tests/**"],
  },
  {
    files: ["**/*.vue", "**/*.ts"],
    languageOptions: {
      parser: typescriptEslintParser,
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        browser: true,
        node: true,
        _: "readonly",
      },
    },
    plugins: {
      vue: eslintPluginVue,
      prettier: eslintPluginPrettier,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "vue/require-default-prop": "off",
      "vue/html-indent": ["error", 2],
      "vue/singleline-html-element-content-newline": "off",
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
