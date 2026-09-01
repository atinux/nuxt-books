import eslintConfigPrettier from 'eslint-config-prettier';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  eslintConfigPrettier,
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: ['server/lib/db/**'],
    rules: { 'no-console': 'off' },
  },
);
