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
]);
