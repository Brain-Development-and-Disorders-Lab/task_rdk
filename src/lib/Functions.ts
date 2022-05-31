/**
 * @summary Utility file for Bang et al. RDK task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/rdk/src/core/util.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

/**
 * Determine the scaling factor to apply to the graphics.
 * @return {number}
 */
export function scaling(): number {
  if (window !== undefined) {
    return (window.outerHeight / window.innerHeight) * 0.8;
  } else {
    return 1.0;
  }
}
