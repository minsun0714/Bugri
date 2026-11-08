import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "src/api/**/*.ts",
      "src/mocks/**/*.ts",
      "src/services/**/*.ts",
      "tests/unit/api/**/*.ts",
      "tests/e2e/mock-api.spec.ts",
    ],
    rules: {
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: {
            array: true,
            object: true,
          },
          AssignmentExpression: {
            array: false,
            object: false,
          },
        },
        {
          enforceForRenamedProperties: true,
        },
      ],
      // Prettier preserves these blank lines; ESLint inserts missing ones.
      // Use the installed core rule without adding a package dependency.
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: [
            "const",
            "let",
            "var",
            "export",
            "function",
            "class",
            "if",
            "switch",
            "for",
            "while",
            "do",
            "try",
            "return",
            "throw",
            "case",
            "default",
            "multiline-expression",
          ],
        },
        {
          blankLine: "always",
          prev: [
            "import",
            "const",
            "let",
            "var",
            "export",
            "function",
            "class",
            "if",
            "switch",
            "for",
            "while",
            "do",
            "try",
            "multiline-expression",
          ],
          next: "*",
        },
        {
          blankLine: "any",
          prev: [
            "singleline-const",
            "singleline-let",
            "singleline-var",
          ],
          next: [
            "singleline-const",
            "singleline-let",
            "singleline-var",
          ],
        },
        {
          blankLine: "any",
          prev: "import",
          next: "import",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./**", "../**"],
              message:
                "src 모듈은 상대 경로 대신 @/ 별칭을 사용하세요.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression[source.value=/^\\./]",
          message:
            "동적 import도 src 모듈은 @/ 별칭을 사용하세요.",
        },
      ],
    },
  },
  // Keep last to disable lint rules that conflict with Prettier.
  prettier,
]);

export default eslintConfig;
