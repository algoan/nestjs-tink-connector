module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'nestjs'],
  extends: ['@algoan/eslint-config', 'plugin:nestjs/recommended'],
  ignorePatterns: ['*.spec.ts'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    '@typescript-eslint/no-extraneous-class': [
      'error',
      {
        allowEmpty: true,
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'parameterProperty',
        format: null,
      },
    ],
    camelcase: ['off'],
  },
};
