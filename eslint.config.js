import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * Configuración plana de ESLint (F-12 / COD-12).
 *
 * - `js.configs.recommended` + `typescript-eslint` recommended: reglas base.
 * - `eslint-plugin-react-hooks`: reglas de hooks de React. Se activan las dos
 *   clásicas (`rules-of-hooks`, `exhaustive-deps`) y el resto de la lista
 *   recomendada; las reglas nuevas tipo React Compiler que chocan con patrones
 *   ya establecidos del proyecto se degradan a `warn` (ver bloque final).
 * - Estilo puramente cosmético → `warn` para no bloquear `npm run lint`.
 *
 * Se ignoran artefactos de build, dependencias, el proyecto Android, activos
 * públicos, la documentación (fuera de control de versiones) y los binarios
 * `.exe` de `scripts/` (B-03).
 */
export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'android',
      'public',
      'docs',
      'scripts/*.exe',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Sin `console` no hay diagnóstico en scripts ni en el bootstrap nativo.
      'no-console': 'off',
      // Estilo, no corrección: se avisa pero no bloquea.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  {
    // Sólo React: reglas de hooks sobre componentes y hooks.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      // `react-hooks` v7 añade reglas estilo React Compiler. Dos de ellas
      // chocan con patrones intencionados ya existentes (inicialización
      // perezosa de <audio> en refs y setState de reset en un efecto) que
      // exigirían refactors fuera del alcance de E7. Se degradan a `warn`
      // para no bloquear `npm run lint`, pero siguen visibles:
      //   - 8 avisos en AudioContext/NarrationContext (refs en render).
      //   - 1 aviso en useAudioAnalyser (setLevels(null) en efecto).
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // Las dos reglas clásicas exigidas por el plan (F-12): se mantienen.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)
