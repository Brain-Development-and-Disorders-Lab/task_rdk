module.exports = {
  root: true,
  ignorePatterns: [
    "webpack.config.js",
    "gulpfile.js",
    ".eslintrc.js",
    "jest.config.js",
    "**/__mocks__/*.js",
    "**/dist/*.js",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier-eslint"],
  rules: {
    "max-len": ["warn", { code: 120 }],
  },
};
