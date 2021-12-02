module.exports = {
  root: true,
  ignorePatterns: [
    'webpack.config.js',
    'gulpfile.js',
    '.eslintrc.js',
    'jest.config.js',
    '**/__mocks__/*.js',
    '**/built/*.js'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
