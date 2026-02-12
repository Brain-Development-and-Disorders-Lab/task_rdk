/**
 * @summary `Stimulus` class to handle abstraction of stimuli specification. Calls functions
 * from the `Graphics` class build stimuli from sub-components. Handles keybindings and timers.
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/classes/Stimulus.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// Type definitions
import { IStimulus } from "../../types";

/**
 * Stimulus abstraction
 */
export class Stimulus {
  // Configuration and readonly variables
  private readonly parameters: IStimulus;
  private readonly stimulusName: string;
  private readonly isInteractive: boolean;
  private readonly onStimulusEnd: any;

  // Stimulus timer, used by `Runner` class
  private timer: number;

  /**
   * Default constructor for Stimulus
   * @param {IStimulus} parameters configuration information
   */
  constructor(parameters: IStimulus) {
    // Store parameters
    this.parameters = parameters;

    // Unpack parameters
    this.stimulusName = parameters.stimulusName;
    this.isInteractive = parameters.isInteractive;
    this.onStimulusEnd = parameters.onStimulusEnd;

    // Timer
    this.timer = null;
  }

  /**
   * Get the parameters of the renderer
   * @return {IStimulus}
   */
  getParameters(): IStimulus {
    return this.parameters;
  }

  /**
   * Setup the keybindings for the stimulus
   */
  setupEventListeners(): void {
    if (this.isInteractive) {
      // Bind keyboard events if specified
      if (this.parameters.onKeyDown) {
        document.addEventListener("keydown", this.parameters.onKeyDown);
      }
      if (this.parameters.onKeyUp) {
        document.addEventListener("keyup", this.parameters.onKeyUp);
      }
    }
  }

  /**
   * Remove keybindings for the stimulus
   */
  clearEventListeners(): void {
    // Unbind keyboard events if specified
    if (this.parameters.onKeyDown) {
      document.removeEventListener("keydown", this.parameters.onKeyDown);
    }
    if (this.parameters.onKeyUp) {
      document.removeEventListener("keyup", this.parameters.onKeyUp);
    }
  }

  getStimulusName(): string {
    return this.stimulusName;
  }

  /**
   * Set the timer of the stimuli
   * @param {number} timer the timer
   */
  setTimer(timer: number) {
    this.clearTimer();
    this.timer = timer;
  }

  /**
   * Retrieve the timer of the stimuli
   * @return {number}
   */
  getTimer(): number {
    return this.timer;
  }

  /**
   * Clear the timer of the stimuli
   */
  clearTimer(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
    }
  }

  /**
   * Get the handler called after each trial
   * @return {() => void}
   */
  getOnStimulusEnd(): any {
    return this.onStimulusEnd;
  }

  /**
   * Run the stimuli animations
   * @param {any} parameters runner properties
   */
  static run(parameters: IStimulus): void {
    // Instantiate graphics.
    const two = parameters.two;
    const graphics = parameters.graphics;

    for (let c = 0; c < parameters.stimulusComponents.length; c++) {
      const component = parameters.stimulusComponents[c];
      if (component === "outline") {
        graphics.addOutline();
      } else if (component === "fixation") {
        graphics.addFixation();
      } else if (component === "dots") {
        graphics.addDots();
      } else if (component === "ccw_arc") {
        graphics.addCounterclockwiseArc();
      } else if (component === "cw_arc") {
        graphics.addClockwiseArc();
      } else if (component === "left_arc") {
        graphics.addLeftArc();
      } else if (component === "right_arc") {
        graphics.addRightArc();
      } else if (component === "indicator") {
        graphics.addReferenceIndicator();
      } else if (component === "left") {
        graphics.addLeftLabel();
      } else if (component === "right") {
        graphics.addRightLabel();
      } else {
        console.warn(`Unknown component: '${component}'`);
      }
    }

    two
      .bind("update", (frameCount: number) => {
        for (let d = 0; d < graphics.getElements().length; d++) {
          const element = graphics.getElements()[d];
          if (element.step) {
            element.step(frameCount);
          }
        }
      })
      .play();
  }
}
