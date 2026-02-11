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
  private parameters: IStimulus;
  private name: string;
  private interactive: boolean;
  private keybindings: any;
  private postTrialHandler: any;
  private timer: number;

  /**
   * Default constructor for Stimulus
   * @param {IStimulus} parameters configuration information
   */
  constructor(parameters: IStimulus) {
    // Store parameters
    this.parameters = parameters;

    // Unpack parameters
    this.name = parameters.name;
    this.interactive = parameters.interactive;
    this.keybindings = parameters.keybindings;
    this.postTrialHandler = parameters.postTrialHandler;

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
  createKeybindings(): void {
    // Check if the stimulus can be interacted with
    if (this.interactive) {
      // Bind keydown events
      for (const binding in this.keybindings) {
        if (this.keybindings[binding]) {
          document.addEventListener("keydown", this.keybindings[binding].handler);
        }
      }

      // Also bind keyup events for decision stimulus
      if (this.name === "decision") {
        document.addEventListener("keyup", (event: KeyboardEvent) => {
          if (window.decisionKeyUpHandler) {
            window.decisionKeyUpHandler(event);
          }
        });
      }
    }
  }

  /**
   * Remove keybindings for the stimulus
   */
  removeKeybindings(): void {
    // Unbind keydown events
    for (const binding in this.keybindings) {
      if (this.keybindings[binding]) {
        document.removeEventListener(
          "keydown",
          this.keybindings[binding].handler
        );
      }
    }

    // Also remove keyup events for decision stimulus
    if (this.name === "decision") {
      document.removeEventListener("keyup", window.decisionKeyUpHandler);
    }

    // Remove post-decision keyup handler if it exists
    if (this.name === "post-decision" && window.postDecisionKeyUpHandler) {
      document.removeEventListener("keyup", window.postDecisionKeyUpHandler);
      window.postDecisionKeyUpHandler = undefined;
    }
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
   * @return {any}
   */
  getPostTrialHandler(): any {
    return this.postTrialHandler;
  }

  /**
   * Run the stimuli animations
   * @param {any} parameters runner properties
   */
  static run(parameters: IStimulus): void {
    // Instantiate graphics.
    const two = parameters.two;
    const graphics = parameters.graphics;

    for (let c = 0; c < parameters.components.length; c++) {
      const component = parameters.components[c];
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
