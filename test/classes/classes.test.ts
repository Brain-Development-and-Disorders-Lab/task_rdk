/**
 * @summary Unit tests for Bang et al. task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/bang_2018_decision_confidence/test/classes.test.js
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// Package dependencies
import { test, expect } from "@jest/globals";
import { Dot } from "../../src/lib/classes/Dot";

test("check that two.js circle object is null", () => {
  const dotParameters = {
    type: "testDot",
    width: 100,
    height: 100,
    viewRadius: 40,
    dotVelocity: 2.0,
    dotRadius: 2.0,
    reference: 0,
    direction: 0,
  };
  const dot = new Dot(0, 0, dotParameters);
  expect(dot.getX()).toBe(0);
});
