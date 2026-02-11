// jsPsych
import { JsPsych } from "jspsych";

// Core modules
import { Dot } from "./Dot";
import { Renderer } from "./Renderer";

// Utility libraries
import _ from "lodash";

// Type definitions
import { IDot } from "../../types";

// Import manipulations
import { Manipulations } from "../index";

/**
 * Graphics class used to interface with the plugin and the renderer class
 */
export class Graphics {
  private jsPsych: JsPsych;
  private trial: any;
  private renderer: Renderer;

  /**
   * Graphics constructor
   * @param {JsPsych} jsPsych Experiment instance of jsPsych
   * @param {any} trial jsPsych trial
   * @param {Renderer} renderer renderer class instance
   */
  constructor(jsPsych: JsPsych, trial: any, renderer: Renderer) {
    this.jsPsych = jsPsych;
    this.trial = trial;
    this.renderer = renderer;

    // Apply color inversion if enabled
    this.applyColorInversion();
  }

  /**
   * Apply color inversion if the `invertColors` manipulation is enabled
   */
  private applyColorInversion(): void {
    if (Manipulations.invertColors) {
      const graphicsContainer = document.getElementsByClassName("graphics-container")[0];
      if (graphicsContainer) {
        graphicsContainer.classList.add("inverted");
      } else {
        console.warn("Graphics container not found for color inversion");
      }
    }
  }

  /**
   * Set the visibility of the mouse cursor
   * @param {boolean} visible the status of cursor visibility
   */
  cursorVisibility(visible = true): void {
    document.getElementById("jspsych-content").style.cursor = visible
      ? "auto"
      : "none";
  }

  /**
   * Setup outlines
   */
  addOutline(): void {
    const viewCircle = this.renderer.createCircle(
      0,
      0,
      this.renderer.getViewRadius(),
      false
    );
    const dotLayer = this.renderer.createRectangle(
      0,
      0,
      this.renderer.getWidth(),
      this.renderer.getHeight(),
      false
    );
    viewCircle.fill = Renderer.getInvertedColor("white");
    dotLayer.fill = Renderer.getInvertedColor("white");
    this.renderer.setRenderLayer(this.renderer.getTarget().makeGroup(dotLayer));
    this.renderer.getRenderLayer().mask = viewCircle;

    const viewCircleOutline = this.renderer.createCircle(
      0,
      0,
      this.renderer.getViewRadius(),
      false
    );
    viewCircleOutline.noFill();
    viewCircleOutline.stroke = Renderer.getInvertedColor("black");
    viewCircleOutline.linewidth = 5;
  }

  /**
   * Create a fixation cross
   */
  addFixation(): void {
    const fixationDiameter = Math.ceil(
      Math.abs(this.renderer.getDistanceFromScreen() * Math.tan(0.4))
    );
    if (
      this.trial.showFeedback === true &&
      this.trial.data.selection !== ""
    ) {
      if (this.trial.data.correct === 1) {
        this.renderer.createFixation(0, 0, fixationDiameter, false, Renderer.getInvertedColor("green"));
      } else {
        this.renderer.createFixation(0, 0, fixationDiameter, false, Renderer.getInvertedColor("red"));
      }
    } else {
      const fixationCircle = this.renderer.createCircle(
        0,
        0,
        fixationDiameter * 0.8,
        true,
        "white",
        "white"
      );
      this.renderer.createFixation(0, 0, fixationDiameter, false, "black");
    }
  }

  /**
   * Create the orange clockwise arc
   */
  addClockwiseArc(): void {
    const startAngle = 2 * Math.PI - this.trial.dotAngle;
    const endAngle = startAngle + Math.PI / 4;
    this.renderer.createArc(startAngle, endAngle + Math.PI / 128, Renderer.getInvertedColor("white"));
    this.renderer.createArc(startAngle, endAngle, Renderer.getInvertedColor("#d78000"));
  }

  /**
   * Create the orange left arc
   */
  addLeftArc(): void {
    const startAngle = Math.PI / 2;
    const endAngle = 2 * Math.PI - Math.PI / 2;
    this.renderer.createArc(startAngle, endAngle, Renderer.getInvertedColor("#d78000"));
  }

  /**
   * Create the blue counterclockwise arc
   */
  addCounterclockwiseArc(): void {
    const reference = 2 * Math.PI - this.trial.dotAngle;
    const startAngle = reference - Math.PI / 4;
    const endAngle = startAngle + Math.PI / 4;
    this.renderer.createArc(startAngle - Math.PI / 128, endAngle, Renderer.getInvertedColor("white"));
    this.renderer.createArc(startAngle, endAngle, Renderer.getInvertedColor("#1792fc"));
  }

  /**
   * Create the blue right arc
   */
  addRightArc(): void {
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    this.renderer.createArc(startAngle, endAngle, Renderer.getInvertedColor("#1792fc"));
  }

  /**
   * Append the left button image to the graphics area
   */
  addLeftKey(): void {
    this.renderer.addImage("left");
  }

  /**
   * Append the right button image to the graphics area
   */
  addRightKey(): void {
    this.renderer.addImage("right");
  }

  /**
   * Append the left label to the graphics area
   */
  addLeftLabel(): void {
    this.renderer.addLabel("left");
  }

  /**
   * Append the right label to the graphics area
   */
  addRightLabel(): void {
    this.renderer.addLabel("right");
  }

  /**
   * Add small rectangle to indicate the position of the reference angle
   */
  addReferenceIndicator(): void {
    const reference = this.trial.dotAngle;
    const length = Math.ceil(Math.abs(Math.tan(0.8))) * 6;
    const width = Math.ceil(Math.abs(Math.tan(0.08))) * 6;
    const x1 =
      (this.renderer.getViewRadius() - length / 2) * Math.cos(reference);
    const y1 =
      (this.renderer.getViewRadius() - length / 2) * Math.sin(reference);
    const x2 = (this.renderer.getViewRadius() + length) * Math.cos(reference);
    const y2 = (this.renderer.getViewRadius() + length) * Math.sin(reference);
    this.renderer.createLine(x1, y1, x2, y2, width);
  }

  /**
   * Create the arrays of dots seen in each stimuli
   */
  addDots(): void {
    // Initial parameters.
    const referenceDotParameters: IDot = {
      type: "reference",
      width: this.renderer.getWidth(),
      height: this.renderer.getHeight(),
      viewRadius: this.renderer.getViewRadius(),
      dotVelocity: this.trial.dotVelocity,
      dotRadius: this.renderer.getDotRadius(),
      dotAngle: this.trial.dotAngle,
    };

    const randomDotParameters: IDot = {
      type: "random",
      width: this.renderer.getWidth(),
      height: this.renderer.getHeight(),
      viewRadius: this.renderer.getViewRadius(),
      dotVelocity: this.trial.dotVelocity,
      dotRadius: this.renderer.getDotRadius(),
      dotAngle: this.trial.dotAngle,
    };

    // Setup dots
    const dotCount = 20 ** 2;
    const dotRowCount = Math.floor(Math.sqrt(dotCount));

    for (let i = -dotRowCount / 2; i < dotRowCount / 2; i++) {
      for (let j = -dotRowCount / 2; j < dotRowCount / 2; j++) {
        const delta = Math.random();
        const x =
          (i * this.renderer.getWidth()) / dotRowCount +
          (delta * this.renderer.getWidth()) / dotRowCount;
        const y =
          (j * this.renderer.getHeight()) / dotRowCount +
          (delta * this.renderer.getHeight()) / dotRowCount;

        if (delta > this.trial.data.activeCoherence) {
          // Non-dynamic dot that is just moving in random paths
          randomDotParameters.dotAngle = 2 * Math.PI * Math.random();
          this.renderer.createDot(new Dot(x, y, randomDotParameters), true);
        } else {
          this.renderer.createDot(new Dot(x, y, referenceDotParameters), true);
        }
      }
    }
  }

  /**
   * Clear all elements from the renderer
   * This removes everything including aperture outline and fixation cross
   * Should only be called at the end of a trial
   */
  clear(): void {
    this.renderer.clearElements();
    this.renderer.clearHTMLElements();
  }

  /**
   * Reset the renderer display to the aperture with the fixation cross
   * This removes all stimuli except the aperture outline and central fixation
   * to prevent flickering between stimulus transitions
   */
  reset(): void {
    // Get all tracked elements
    const trackedElements = this.renderer.getElements();

    // Remove all tracked elements
    for (let i = 0; i < trackedElements.length; i++) {
      this.renderer.getTarget().remove(trackedElements[i]);
    }

    // Clear decision containers if they exist
    this.renderer.clearDecisionContainers();
  }
}
