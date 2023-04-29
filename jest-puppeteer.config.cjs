/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = {
  launch: {
    headless: true,
  },
  browser: "chromium",
  server: {
    command: "yarn start",
    debug: true,
    launchTimeout: 20000,
  },
};
