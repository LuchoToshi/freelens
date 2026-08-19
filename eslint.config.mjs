import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // No em dashes in UI or prompt content (D3). Scoped to string/template
  // literals, so it never fires on the ~80 doc comments already in the
  // codebase that legitimately use one. Test fixtures are excluded because
  // draftGuards.test.ts deliberately embeds em dashes to test the detector.
  // The EM_DASH detection constants themselves carry a disable comment.
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\u2014/]",
          message: "No em dashes in UI or prompt content (D3). Use a comma, period, parentheses, or colon instead.",
        },
        {
          selector: "TemplateElement[value.raw=/\\u2014/]",
          message: "No em dashes in UI or prompt content (D3). Use a comma, period, parentheses, or colon instead.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local build output. Gitignored, but eslint walks it anyway and reports
    // thousands of problems in bundled vendor code that we do not author.
    ".vercel/**",
    "coverage/**",
    // Agent tooling scripts (plain-Node .cjs), not shipped app code.
    ".claude/**",
  ]),
]);

export default eslintConfig;
