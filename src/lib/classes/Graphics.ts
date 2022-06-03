// Configuration
import { configuration } from "../../configuration";

// 'Stimuli' type
import { Stimuli } from "neurocog/dist/lib/classes/Stimuli";

// Core modules
import { Dot } from "./Dot";
import { Renderer } from "./Renderer";

/**
 * Graphics class used to interface with the plugin and the renderer class
 */
export class Graphics {
  private trial: any;
  private renderer: Renderer;
  private imageCollection: Stimuli;

  /**
   * Graphics constructor
   * @param {any} trial jsPsych trial
   * @param {Renderer} renderer renderer class instance
   */
  constructor(trial: any, renderer: Renderer) {
    this.trial = trial;
    this.renderer = renderer;

    // Get the ImageCollection
    this.imageCollection = window.Experiment.getStimuli();
  }

  /**
   * Set the visibility of the mouse cursor
   * @param {boolean} _visible the status of cursor visibility
   */
  cursorVisibility(_visible = true): void {
    const _target = document.getElementById("jspsych-content");
    if (_visible) {
      _target.style.cursor = "auto";
    } else {
      _target.style.cursor = "none";
    }
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
    const referenceDotParameters = {
      type: "reference",
      width: this.renderer.getWidth(),
      height: this.renderer.getHeight(),
      viewRadius: this.renderer.getViewRadius(),
      dotVelocity: this.trial.dotVelocity,
      dotRadius: this.renderer.getDotRadius(),
      direction: this.trial.dotDirection,
    };

    const randomDotParameters = {
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
   * Setup HTML elements for confidence slider
   * @param {any} parameters configuration information for the slider
   */
  addConfidence(parameters: any): void {
    // Confidence instructions
    let html = "";

    // Key images for target
    if (configuration.keys === "spectrometer") {
      html +=
        `<div><img src="` +
        `${this.imageCollection.getImage(
          "ControlsConfidenceSpectrometer.png"
        )}" ` +
        `style="${configuration.style.controls}"></div>`;
    } else {
      html +=
        `<div><img src="` +
        `${this.imageCollection.getImage("ControlsConfidenceDesktop.png")}" ` +
        `style="${configuration.style.controls}"></div>`;
    }

    // Confidence slider
    const labels = ["50%", "60%", "70%", "80%", "90%", "100%"];
    html += `<div>`;
    html += `<div style="margin: 50px 0px; ` + `width: 100%;">`;
    html +=
      `<div style="position: relative; width: 60vw;">` +
      `<input type="range" value="70" min="50" max="100" ` +
      `step="10" style="width: 100%;" ` +
      `class="confidence-slider-hidden"` +
      `id="confidence-slider">` +
      `</input>`;
    html += `<div>`;
    // Add labels
    for (let i = 0; i < labels.length; i++) {
      const width = 100 / (labels.length - 1);
      const offset = i * width - width / 2;
      html +=
        `<div style="display: inline-block; position: absolute; ` +
        `left:${offset}%; text-align: center; ` +
        `margin-top: 4vh; width: ${width}%;">`;
      html +=
        `<span style="text-align: center; ` +
        `font-size: 1.5em;">${labels[i]}</span>`;
      html += `</div>`;
    }
    html += `</div></div></div></div><br><hr>`;

    // Button to notify of a mistake
    html += `<div id="mistake-button-container">`;
    html +=
      `<button type="button" id="mistake-button" ` + `class="jspsych-btn">`;
    html += `I made a mistake`;
    html += `</button>`;
    if (configuration.keys === "spectrometer") {
      html +=
        `<img src="${this.imageCollection.getImage("1.png")}" ` +
        `style="${configuration.style.keyboard}">`;
    } else {
      html +=
        `<img src="${this.imageCollection.getImage("D.png")}" ` +
        `style="${configuration.style.keyboard}">`;
    }
    html += `</div>`;

    this.renderer.getDisplayElement().parentNode.innerHTML = html;

    // Try to hide the thumb?
    document
      .getElementById("confidence-slider")
      .addEventListener("click", function () {
        const slider = document.getElementById("confidence-slider");
        slider.className = "confidence-slider";
      });

    // Bind appropriate event listeners to actions
    document.addEventListener("keyup", parameters.eventHandler);
    if (configuration.keys === "desktop") {
      document
        .getElementById("mistake-button")
        .addEventListener("click", parameters.eventHandler);
    }
  }

  /**
   * Clear all elements from the renderer
   */
  clear(): void {
    this.renderer.clearElements();
  }
}
