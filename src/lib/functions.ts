/**
 * @summary Utility file for Bang et al. RDK task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/rdk/src/core/util.ts
 * @author Henry Burgess <s4481993@student.uq.edu.au>
 */

import { configuration } from "../configuration";

/**
 * Calculate the total duration of the games
 * @return {number} duration
 */
export const calculateDuration = (): number => {
  // Total number of seconds
  let total =
    configuration.manipulations.numTutorialTrials +
    configuration.manipulations.numPracticeTrials +
    configuration.manipulations.numCalibrationOneTrials +
    configuration.manipulations.numMainTrials;
  total *= 0.75 + 1 + 2 + 0.25 + 4;

  total /= 60;
  return Math.ceil(total);
}

/**
 * Determine the scaling factor to apply to the graphics.
 * @return {number}
 */
export const scaling = (): number => {
  if (window !== undefined) {
    return (window.outerHeight / window.innerHeight) * 0.8;
  } else {
    return 1.0;
  }
}
