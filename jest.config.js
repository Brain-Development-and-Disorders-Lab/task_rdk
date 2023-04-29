// Jest configuration
module.exports = {
  projects: [
    {
      displayName: "Unit tests",
      testMatch: ["<rootDir>/test/classes/**/*.test.ts"],
      globals: {
        __TARGET__: "desktop",
      },
      testEnvironment: "jsdom",
      testPathIgnorePatterns: ["/node_modules/", "dist"],
      moduleNameMapper: {
        "\\.(css|less)$": "<rootDir>/test/__mocks__/styles.js",
      },
      transform: {
        "^.+\\.ts?$": "ts-jest",
        "^.+\\.js?$": "ts-jest",
      },
    },
    {
      displayName: "Integration tests",
      testMatch: ["<rootDir>/test/integration/**/*.test.ts"],
      globals: {
        __TARGET__: "desktop",
      },
      preset: "jest-puppeteer",
      testPathIgnorePatterns: ["/node_modules/", "dist"],
      moduleNameMapper: {
        "\\.(css|less)$": "<rootDir>/test/__mocks__/styles.js",
      },
      transform: {
        "^.+\\.ts?$": "ts-jest",
        "^.+\\.js?$": "ts-jest",
      },
    },
  ]
};
