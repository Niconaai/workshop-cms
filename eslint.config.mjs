import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals"; // Needed for languageOptions
import tsParser from "@typescript-eslint/parser"; // Needed for parser
import tsPlugin from "@typescript-eslint/eslint-plugin"; // Needed for plugin rules

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"), // Keep Next.js core vitals rules

  // Add a specific configuration object for TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"], // Target TypeScript files
    plugins: {
      // Include the TypeScript ESLint plugin
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      // Specify the TypeScript parser
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json", // Point to your tsconfig
      },
      globals: {
        ...globals.browser, // Add browser globals
        ...globals.node, // Add node globals
      },
    },
    // Add the rules section here
    rules: {
      // Inherit recommended rules from Next.js TypeScript config
      ...tsPlugin.configs["eslint-recommended"].rules, // Base ESLint rules
      ...tsPlugin.configs["recommended"].rules, // Recommended TS rules
      // Add your override here:
      "@typescript-eslint/no-explicit-any": "off", // Disable the 'no-explicit-any' rule
      // Add any other specific rule overrides below
      // e.g., "react/no-unescaped-entities": "warn",
    },
  },
  // Keep your global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;