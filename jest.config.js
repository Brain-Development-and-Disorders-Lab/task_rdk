module.exports = {
  globals: {
    __TARGET__: "desktop",
  },
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "dist"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styles.js",
  },
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.js?$": "ts-jest",
  },
};
