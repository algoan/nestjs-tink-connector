module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'nestjs'],
  extends: [
    '@algoan/eslint-config',
    'plugin:nestjs/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error', {
        devDependencies: true,
      }
    ],
    '@typescript-eslint/no-extraneous-class': [
      'error',
      {
        allowEmpty: true,
      }
    ],
    'nestjs/use-validation-pipe': 'off'
  }
};
