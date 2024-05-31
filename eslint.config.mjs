import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    env: {
      browser: true,
      es6: true,
    },
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    ignores: ['node_modules/*'],
    rules: {
      'keyword-spacing': 'error',
      'linebreak-style': 'error',
      semi: 'error',
      'space-before-blocks': 'error',
      'space-before-function-paren': 'error',
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
];
