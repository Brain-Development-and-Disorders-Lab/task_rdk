/**
 * @summary Utility functions for RDK task
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/lib/functions.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// Import experiment Manipulations
import { Manipulations } from ".";

// Custom types
import { SelectionOptions } from "../types";

/**
 * Translate a keycode into one of the specified `SelectionOptions`
 * @param keycode Currently pressed keycode
 * @param buttonMap The specified inputs set out for that trial
 * @return {SelectionOptions}
 */
export const getSelectionFromInput = (keycode: string, buttonMap: any): SelectionOptions => {
  switch (keycode) {
    case buttonMap["1"]:
      return "vc_l";
    case buttonMap["2"]:
      return "sc_l";
    case buttonMap["3"]:
      return "sc_r";
    case buttonMap["4"]:
      return "vc_r";
  };
};

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

/**
 * Check if color inversion is enabled and return appropriate colors
 * @param {string} defaultColor the default color to use
 * @return {string} the color to use (inverted if enabled)
 */
export const getInvertedColor = (defaultColor: string): string => {
  if (!Manipulations.invertColors) {
    return defaultColor;
  }

  // Invert common colors for MRI context
  switch (defaultColor) {
    case "black":
      return "white";
    case "white":
      return "black";
    default:
      return defaultColor;
  }
};

/**
 * Takes coordinates of form x [-150, 150], y [-150, 150] and
 * translates them to x [0, 300], y [0, 300]
 * @param {number} x original x-coordinate
 * @param {number} y original y-coordinate
 * @param {number} width width of the view
 * @param {number} height height of the view
 * @return {number[]} translated x and y coordinates
 */
export const translate = (x: number, y: number, width: number, height: number): number[] => {
  x += width / 2;
  y = height / 2 - y;
  return [x, y];
};

/**
 * Determine if a set of coordinates is visible in the view
 * @param {number} x the x-coordinate of the object
 * @param {number} y the y-coordinate of the object
 * @param {number} radius the radius of the view
 * @return {boolean}
 */
export const visible = (x: number, y: number, radius: number): boolean => {
  const distance = Math.sqrt(x ** 2 + y ** 2);
  return distance < radius;
};

/**
 * Determine if a set of coodinates is inside the view
 * @param {number} x the x-coordinate of the object
 * @param {number} y the y-coordinate of the object
 * @param {number} w the width of the view
 * @param {number} h the height of the view
 * @return {boolean}
 */
export const renderable = (x: number, y: number, w: number, h: number): boolean => {
  return x >= 0 && x <= w && y >= 0 && y <= h;
};
