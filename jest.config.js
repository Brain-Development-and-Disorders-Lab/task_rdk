module.exports = {
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "built"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styles.js",
  },
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.js?$": "ts-jest",
  },
};
