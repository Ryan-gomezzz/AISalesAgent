module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'import/order': ['error', { 'alphabetize': { order: 'asc', caseInsensitive: true }, 'newlines-between': 'never' }],
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }]
  }
};
