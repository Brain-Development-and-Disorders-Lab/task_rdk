module.exports = {
  globals: {
    __TARGET__: "desktop",
  },
  preset: "jest-puppeteer",
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "dist"],
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styles.js",
  },
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.js?$": "ts-jest",
  },
};
