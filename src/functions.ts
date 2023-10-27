/**
 * @summary Utility functions for RDK task
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/lib/functions.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */
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
};
