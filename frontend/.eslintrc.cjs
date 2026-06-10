module.exports = {
  root: true,
  ignorePatterns: ['dist/**', 'node_modules/**'],
  overrides: [
    {
      files: ['*.html'],
      parser: '@angular-eslint/template-parser',
      plugins: ['@angular-eslint/template', 'prettier'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/accessibility',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@angular-eslint/template/prefer-self-closing-tags': 'error',
        '@angular-eslint/template/no-inline-styles': 'error',
        '@angular-eslint/template/prefer-control-flow': 'error',
        '@angular-eslint/template/cyclomatic-complexity': [
          'warn',
          { maxComplexity: 50 },
        ],
        '@angular-eslint/template/click-events-have-key-events': 'off',
        '@angular-eslint/template/interactive-supports-focus': 'off',
        'prettier/prettier': 'error',
      },
    },
  ],
};
