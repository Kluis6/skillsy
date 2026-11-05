import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  // The mobile app has its own lint setup (`npx expo lint` in apps/mobile).
  { ignores: ["apps/**"] },
  {
    extends: [...next],
    // The codebase is warning-free; keep these as errors so CI blocks regressions.
    rules: {
      "react-hooks/purity": "error",
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/incompatible-library": "error",
    },
  },
  {
    // Links and navigation keep the page's language (docs/i18n-plan.md):
    // use @/lib/i18n/navigation instead of next/link and next/navigation's
    // useRouter/usePathname. The admin panel stays Portuguese-only.
    files: ["app/**/*.tsx", "components/**/*.tsx", "hooks/**/*.tsx"],
    ignores: ["app/[[]lang]/admin/**", "components/admin-*.tsx", "components/ui/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "next/link", message: "Use o Link de @/lib/i18n/navigation (mantém o idioma da página)." },
          { name: "next/navigation", importNames: ["useRouter", "usePathname"], message: "Use @/lib/i18n/navigation (mantém o idioma da página)." },
        ],
      }],
    },
  },
]);
