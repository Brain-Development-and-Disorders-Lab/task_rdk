/**
 * Automated integration testing for the RDK task.
 *
 * Testing configuration for desktop delivery target.
 */
// Variables
const LOCATION = "http://localhost:8080";
const MAX_TIMEOUT = 20000;

describe("Desktop testing", () => {
  beforeAll(async () => {
    await page.goto(LOCATION);
  }, MAX_TIMEOUT);

  it("navigates to the task", async () => {
    await expect(page.title()).resolves.toMatch("RDK Game");
  });
});
