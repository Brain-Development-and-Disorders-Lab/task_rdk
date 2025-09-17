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
    viewCircle.fill = this.renderer.getInvertedColor("white");
    dotLayer.fill = this.renderer.getInvertedColor("white");
    this.renderer.setRenderLayer(this.renderer.getTarget().makeGroup(dotLayer));
    this.renderer.getRenderLayer().mask = viewCircle;

    const viewCircleOutline = this.renderer.createCircle(
      0,
      0,
      this.renderer.getViewRadius(),
      false
    );
    viewCircleOutline.noFill();
    viewCircleOutline.stroke = this.renderer.getInvertedColor("black");
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
        this.renderer.createFixation(0, 0, fixationDiameter, false, this.renderer.getInvertedColor("green"));
      } else {
        this.renderer.createFixation(0, 0, fixationDiameter, false, this.renderer.getInvertedColor("red"));
      }
    } else {
      const fixationCircle = this.renderer.createCircle(
        0,
        0,
        fixationDiameter * 0.8,
        true, // Set to true to ensure it's tracked
        "white", // Pass white so it gets inverted to black background circle
        "white"
      );
      this.renderer.createFixation(0, 0, fixationDiameter, false, "black"); // Pass black so it gets inverted to white fixation cross
    }
  }

  /**
   * Create the orange clockwise arc
   */
  addClockwiseArc(): void {
    const startAngle = 2 * Math.PI - this.trial.dotDirection;
    const endAngle = startAngle + Math.PI / 4;
    this.renderer.createArc(startAngle, endAngle + Math.PI / 128, this.renderer.getInvertedColor("white"));
    this.renderer.createArc(startAngle, endAngle, this.renderer.getInvertedColor("#d78000"));
  }

  /**
   * Create the orange left arc
   */
  addLeftArc(): void {
    const startAngle = Math.PI / 2;
    const endAngle = 2 * Math.PI - Math.PI / 2;
    this.renderer.createArc(startAngle, endAngle, this.renderer.getInvertedColor("#d78000"));
  }

  /**
   * Create the blue counterclockwise arc
   */
  addCounterclockwiseArc(): void {
    const reference = 2 * Math.PI - this.trial.dotDirection;
    const startAngle = reference - Math.PI / 4;
    const endAngle = startAngle + Math.PI / 4;
    this.renderer.createArc(startAngle - Math.PI / 128, endAngle, this.renderer.getInvertedColor("white"));
    this.renderer.createArc(startAngle, endAngle, this.renderer.getInvertedColor("#3ea3a3"));
  }

  /**
   * Create the blue right arc
   */
  addRightArc(): void {
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    this.renderer.createArc(startAngle, endAngle, this.renderer.getInvertedColor("#3ea3a3"));
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
   * Setup HTML elements for confidence selection element
   * @param parameters configuration information for confidence selection
   */
  addConfidence(parameters: any): void {
    // Confidence instructions
    let html = "";

    // Controls for confidence slider and submission
    if (__TARGET__ === "spectrometer") {
      html += `<div id="confidence-controls-container">`;
      // Decrease confidence
      html += `<div id="confidence-controls-container-element">`;
      html += Renderer.getEmbeddedControllerButton(1);
      html += `<p style="font-size: large; font-weight: bold;">Decrease Confidence</p>`;
      html += `</div>`;

      // Submit
      html += `<div id="confidence-controls-container-element">`;
      html += `<p style="font-size: large; font-weight: bold;">Continue</p>`;
      html += Renderer.getEmbeddedControllerButton(3);
      html += `</div>`;

      // Increase confidence
      html += `<div id="confidence-controls-container-element">`;
      html += `<p style="font-size: large; font-weight: bold;">Increase Confidence</p>`;
      html += Renderer.getEmbeddedControllerButton(4);
      html += `</div>`;
      html += `</div>`;
    } else {
      html += `<div id="confidence-controls-container">`;
      // Decrease confidence
      html += `<div id="confidence-controls-container-element">`;
      html += Renderer.getEmbeddedKeyboardButton("F");
      html += `<p style="font-size: large; font-weight: bold;">Decrease Confidence</p>`;
      html += `</div>`;

      // Submit
      html += `<div id="confidence-controls-container-element">`;
      html += `<p style="font-size: large; font-weight: bold;">Continue</p>`;
      html += Renderer.getEmbeddedKeyboardButton("K");
      html += `</div>`;

      // Increase confidence
      html += `<div id="confidence-controls-container-element">`;
      html += `<p style="font-size: large; font-weight: bold;">Increase Confidence</p>`;
      html += Renderer.getEmbeddedKeyboardButton("J");
      html += `</div>`;
      html += `</div>`;
    }

    // Confidence slider
    html += `<div style="margin: 50px 0px; height: 80px; width: 100%; display: flex; justify-content: center; align-items: center;">`;
    html += `<div style="position: relative; width: 60vw;">`;
    html += `<input type="range" value="70" min="50" max="100" step="10" style="width: 100%;" class="confidence-slider-hidden" id="confidence-slider">`;
    html += `</input>`;

    // Add labels
    const labels = ["50%", "60%", "70%", "80%", "90%", "100%"];
    html += `<div>`;
    for (let i = 0; i < labels.length; i++) {
      const width = 100 / (labels.length - 1);
      const offset = i * width - width / 2;
      html += `<div style="display: inline-block; position: absolute; left:${offset}%; text-align: center; margin-top: 4vh; width: ${width}%;">`;
      html += `<span style="text-align: center; font-size: 1.5em;">${labels[i]}</span>`;
      html += `</div>`;
    }
    html += `</div>`;
    html += `</div>`;
    html += `<br>`;
    html += `</div>`;

    // Button to notify of a mistake
    html += `<div id="mistake-button-container">`;
    if (__TARGET__ === "spectrometer") {
      html += `<p style="font-size: large; font-weight: bold">`;
      html += `I made a mistake`;
      html += `</p>`;
      html += Renderer.getEmbeddedControllerButton(2);
    } else {
      html += `<button id="mistake-button" class="jspsych-btn">`;
      html += `I made a mistake`;
      html += `</button>`;
      html += Renderer.getEmbeddedKeyboardButton("D");
    }
    html += `</div>`;

    // Add the HTML to the display element
    this.renderer.getDisplayElement().parentNode.innerHTML = html;

    // Try to hide the thumb
    document
      .getElementById("confidence-slider")
      .addEventListener("click", () => {
        const slider = document.getElementById("confidence-slider");
        slider.className = "confidence-slider";
      });

    // Bind appropriate event listeners to actions
    document.addEventListener("keyup", parameters.eventHandler);
    if (__TARGET__ === "desktop") {
      document
        .getElementById("mistake-button")
        .addEventListener("click", parameters.eventHandler);
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
  }
}
