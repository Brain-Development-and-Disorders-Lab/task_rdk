// jsPsych
import { JsPsych } from "jspsych";

// Core modules
import { Dot } from "./Dot";
import { Renderer } from "./Renderer";

// Utility libraries
import _ from "lodash";

// Type definitions
import { IDot } from "../../types";

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
    viewCircle.fill = "white";
    dotLayer.fill = "white";
    this.renderer.setRenderLayer(this.renderer.getTarget().makeGroup(dotLayer));
    this.renderer.getRenderLayer().mask = viewCircle;

    const viewCircleOutline = this.renderer.createCircle(
      0,
      0,
      this.renderer.getViewRadius(),
      false
    );
    viewCircleOutline.noFill();
    viewCircleOutline.stroke = "black";
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
      this.trial.data.referenceSelection !== ""
    ) {
      if (this.trial.data.correct === 1) {
        this.renderer.createFixation(0, 0, fixationDiameter, false, "green");
      } else {
        this.renderer.createFixation(0, 0, fixationDiameter, false, "red");
      }
    } else {
      this.renderer.createCircle(
        0,
        0,
        fixationDiameter * 0.8,
        false,
        "white",
        "white"
      );
      this.renderer.createFixation(0, 0, fixationDiameter, false);
    }
  }

  /**
   * Create the orange clockwise arc
   */
  addClockwiseArc(): void {
    const startAngle = 2 * Math.PI - this.trial.dotDirection;
    const endAngle = startAngle + Math.PI / 4;
    this.renderer.createArc(startAngle, endAngle + Math.PI / 128, "white");
    this.renderer.createArc(startAngle, endAngle, "#d78000");
  }

  /**
   * Create the orange left arc
   */
  addLeftArc(): void {
    const startAngle = Math.PI / 2;
    const endAngle = 2 * Math.PI - Math.PI / 2;
    this.renderer.createArc(startAngle, endAngle, "#d78000");
  }

  /**
   * Create the blue counterclockwise arc
   */
  addCounterclockwiseArc(): void {
    const reference = 2 * Math.PI - this.trial.dotDirection;
    const startAngle = reference - Math.PI / 4;
    const endAngle = startAngle + Math.PI / 4;
    this.renderer.createArc(startAngle - Math.PI / 128, endAngle, "white");
    this.renderer.createArc(startAngle, endAngle, "#3ea3a3");
  }

  /**
   * Create the blue right arc
   */
  addRightArc(): void {
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    this.renderer.createArc(startAngle, endAngle, "#3ea3a3");
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
    const reference = this.trial.dotDirection;
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
      direction: this.trial.dotDirection,
    };

    const randomDotParameters: IDot = {
      type: "random",
      width: this.renderer.getWidth(),
      height: this.renderer.getHeight(),
      viewRadius: this.renderer.getViewRadius(),
      dotVelocity: this.trial.dotVelocity,
      dotRadius: this.renderer.getDotRadius(),
      direction: this.trial.dotDirection,
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

        if (delta > this.trial.data.coherence) {
          // Non-dynamic dot that is just moving in random paths
          randomDotParameters.direction = 2 * Math.PI * Math.random();
          this.renderer.createDot(new Dot(x, y, randomDotParameters), true);
        } else {
          this.renderer.createDot(new Dot(x, y, referenceDotParameters), true);
        }
      }
    }
  }

  /**
   * Setup HTML elements for confidence "forced-choice" element
   * @param parameters configuration information for confidence selection
   */
  addForcedConfidence(parameters: any): void {
    // Confidence instructions
    let html = "";

    // Confidence prompt
    html += `<div>`;
    html += `<p style="font-size: x-large;">Between the previous trial and this trial, did you feel more confident about your response to:</p>`;
    html += `<p style="font-size: x-large;">The previous trial or this trial?</p>`;
    html += `<br>`;
    html += `</div>`;

    // Confidence buttons
    html += `<div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">`;
    html +=
      `<div style="display: flex; flex-direction: column; align-items: center;">` +
      `<p style="font-weight: bold; font-size: x-large;">Previous trial</p>` +
      `<div style="display: flex; flex-direction: column; align-items: center;">` +
      this.renderer.addButton("Left").outerHTML +
      `</div>` +
      `</div>`;
    html +=
      `<div style="display: flex; flex-direction: column; align-items: center;">` +
      `<p style="font-weight: bold; font-size: x-large;">This trial</p>` +
      `<div style="display: flex; flex-direction: column; align-items: center;">` +
      this.renderer.addButton("Right").outerHTML +
      `</div>` +
      `</div>`;
    html += `</div>`;
    this.renderer.getDisplayElement().parentNode.innerHTML = html;

    // Bind appropriate event listeners to actions
    document.addEventListener("keyup", parameters.eventHandler);
  }

  /**
   * Clear all elements from the renderer
   */
  clear(): void {
    this.renderer.clearElements();
  }
}
