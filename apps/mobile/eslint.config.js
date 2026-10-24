const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*'],
  },
  {
    // Icons need cssInterop to honor className on Android; src/lib/icons.ts
    // registers them.
    ignores: ['src/lib/icons.ts', 'src/components/ui/icon.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react-native',
              message: "Importe de '@/lib/icons' (e registre o ícone lá).",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
]);
