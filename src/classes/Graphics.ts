// jsPsych
import { JsPsych } from "jspsych";

// Two.js
import Two from "two.js";
import { Circle } from "two.js/src/shapes/circle";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { ArcSegment } from "two.js/src/shapes/arc-segment";

// Core modules
import { Dot } from "./Dot";

// Utility libraries
import _ from "lodash";

// Type definitions
import { GraphicsParameters, DotParameters, SelectionOptions } from "../../types";

// Import manipulations
import { Manipulations } from "../index";

// Custom functions
import { getInvertedColor, translate } from "../functions";

/**
 * Graphics class used to interface with the plugin and the renderer class
 */
export class Graphics {
  private jsPsych: JsPsych;
  private trial: any;
  private two: Two;
  private distanceFromScreen: number;
  private apertureRadius: number;
  private dotRadius: number;
  private viewWidth: number;
  private viewHeight: number;
  private renderLayer: any;
  private elements: any[];

  /**
   * Graphics constructor
   * @param {JsPsych} jsPsych Experiment instance of jsPsych
   * @param {any} trial jsPsych trial
   */
  constructor(jsPsych: JsPsych, trial: any, parameters: GraphicsParameters) {
    this.jsPsych = jsPsych;
    this.trial = trial;
    this.two = parameters.two;
    this.distanceFromScreen = parameters.distanceFromScreen;
    this.apertureRadius = parameters.apertureRadius;
    this.dotRadius = parameters.dotRadius;
    this.viewWidth = parameters.viewWidth;
    this.viewHeight = parameters.viewHeight;
    this.renderLayer = null;
    this.elements = [];

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
  cursorVisibility(visible: boolean = true): void {
    document.getElementById("jspsych-content").style.cursor = visible ? "auto" : "none";
  }

  /**
   * Setup outlines
   */
  addOutline(): void {
    const viewCircle = this.createCircle(0, 0, this.apertureRadius, false);
    const dotLayer = this.createRectangle(0, 0, this.viewWidth, this.viewHeight, false);
    viewCircle.fill = getInvertedColor("white");
    dotLayer.fill = getInvertedColor("white");
    this.renderLayer = this.two.makeGroup(dotLayer);
    this.renderLayer.mask = viewCircle;

    const viewCircleOutline = this.createCircle(0, 0, this.apertureRadius, false);
    viewCircleOutline.noFill();
    viewCircleOutline.stroke = getInvertedColor("black");
    viewCircleOutline.linewidth = 5;
  }

  /**
   * Create a fixation cross
   */
  addFixation(): void {
    const fixationDiameter = Math.ceil(Math.abs(this.distanceFromScreen * Math.tan(0.4)));
    if (this.trial.showFeedback === true && this.trial.data.selection !== "") {
      if (this.trial.data.correct === 1) {
        this.createFixation(0, 0, fixationDiameter, false, getInvertedColor("green"));
      } else {
        this.createFixation(0, 0, fixationDiameter, false, getInvertedColor("red"));
      }
    } else {
      const fixationCircle = this.createCircle(0, 0, fixationDiameter * 0.8, true, "white", "white");
      this.createFixation(0, 0, fixationDiameter, false, "black");
    }
  }

  /**
   * Create the orange clockwise arc
   */
  addClockwiseArc(): void {
    const startAngle = 2 * Math.PI - this.trial.dotAngle;
    const endAngle = startAngle + Math.PI / 4;
    this.createArc(startAngle, endAngle + Math.PI / 128, getInvertedColor("white"));
    this.createArc(startAngle, endAngle, getInvertedColor("#d78000"));
  }

  /**
   * Create the orange left arc
   */
  addLeftArc(): void {
    const startAngle = Math.PI / 2;
    const endAngle = 2 * Math.PI - Math.PI / 2;
    this.createArc(startAngle, endAngle, getInvertedColor("#d78000"));
  }

  /**
   * Create the blue counterclockwise arc
   */
  addCounterclockwiseArc(): void {
    const reference = 2 * Math.PI - this.trial.dotAngle;
    const startAngle = reference - Math.PI / 4;
    const endAngle = startAngle + Math.PI / 4;
    this.createArc(startAngle - Math.PI / 128, endAngle, getInvertedColor("white"));
    this.createArc(startAngle, endAngle, getInvertedColor("#1792fc"));
  }

  /**
   * Create the blue right arc
   */
  addRightArc(): void {
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    this.createArc(startAngle, endAngle, getInvertedColor("#1792fc"));
  }

  /**
   * Append the left button image to the graphics area
   */
  addLeftKey(): void {
    this.addImage("left");
  }

  /**
   * Append the right button image to the graphics area
   */
  addRightKey(): void {
    this.addImage("right");
  }

  /**
   * Append the left label to the graphics area
   */
  addLeftLabel(): void {
    this.addLabel("left");
  }

  /**
   * Append the right label to the graphics area
   */
  addRightLabel(): void {
    this.addLabel("right");
  }

  /**
   * Add small rectangle to indicate the position of the reference angle
   */
  addReferenceIndicator(): void {
    const reference = this.trial.dotAngle;
    const length = Math.ceil(Math.abs(Math.tan(0.8))) * 6;
    const width = Math.ceil(Math.abs(Math.tan(0.08))) * 6;
    const x1 = (this.apertureRadius - length / 2) * Math.cos(reference);
    const y1 = (this.apertureRadius - length / 2) * Math.sin(reference);
    const x2 = (this.apertureRadius + length) * Math.cos(reference);
    const y2 = (this.apertureRadius + length) * Math.sin(reference);
    this.createLine(x1, y1, x2, y2, width);
  }

  /**
   * Create the arrays of dots seen in each stimuli
   */
  addDots(): void {
    // Initial parameters.
    const referenceDotParameters: DotParameters = {
      type: "reference",
      viewWidth: this.viewWidth,
      viewHeight: this.viewHeight,
      apertureRadius: this.apertureRadius,
      dotVelocity: this.trial.dotVelocity,
      dotRadius: this.dotRadius,
      dotAngle: this.trial.dotAngle,
    };

    const randomDotParameters: DotParameters = {
      type: "random",
      viewWidth: this.viewWidth,
      viewHeight: this.viewHeight,
      apertureRadius: this.apertureRadius,
      dotVelocity: this.trial.dotVelocity,
      dotRadius: this.dotRadius,
      dotAngle: this.trial.dotAngle,
    };

    // Setup dots
    const dotCount = 20 ** 2;
    const dotRowCount = Math.floor(Math.sqrt(dotCount));

    for (let i = -dotRowCount / 2; i < dotRowCount / 2; i++) {
      for (let j = -dotRowCount / 2; j < dotRowCount / 2; j++) {
        const delta = Math.random();
        const x = (i * this.viewWidth) / dotRowCount + (delta * this.viewWidth) / dotRowCount;
        const y = (j * this.viewHeight) / dotRowCount + (delta * this.viewHeight) / dotRowCount;

        if (delta > this.trial.activeCoherence) {
          // Non-dynamic dot that is just moving in random paths
          randomDotParameters.dotAngle = 2 * Math.PI * Math.random();
          this.createDot(new Dot(x, y, randomDotParameters), true);
        } else {
          this.createDot(new Dot(x, y, referenceDotParameters), true);
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
    this.clearElements();
    this.clearHTMLElements();
  }

  /**
   * Reset the renderer display to the aperture with the fixation cross
   * This removes all stimuli except the aperture outline and central fixation
   * to prevent flickering between stimulus transitions
   */
  reset(): void {
    // Get all tracked elements
    const trackedElements = this.getElements();

    // Remove all tracked elements
    for (let i = 0; i < trackedElements.length; i++) {
      this.two.remove(trackedElements[i]);
    }

    // Clear decision containers if they exist
    const leftContainer = document.getElementById("left-container");
    if (leftContainer) {
      leftContainer.remove();
    }

    const rightContainer = document.getElementById("right-container");
    if (rightContainer) {
      rightContainer.remove();
    }
  }

  /**
   * Adds an element to the list of renderered element
   * @param {any} element add an element
   */
  addElement(element: any): void {
    this.elements.push(element);
  }

  /**
   * Retrieves the list of renderable elements
   * @return {any[]} the array of elements
   */
  getElements(): any[] {
    return this.elements;
  }

  /**
   * Clear the list of renderable elements
   */
  clearElements(): void {
    for (let e = 0; e < this.elements.length; e++) {
      this.two.remove(this.elements[e]);
      this.elements[e] = null;
    }
    this.elements = [];
    this.two.clear();
  }

  /**
   * Clear all HTML elements from the display
   * This removes HTML elements like labels, etc.
   */
  clearHTMLElements(): void {
    const graphicsContainer = document.getElementsByClassName("graphics-container")[0];
    if (graphicsContainer) {
      // Remove all child elements except the Two.js canvas div
      const children = Array.from(graphicsContainer.children);
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // Keep the Two.js canvas div (it should be the first child)
        if (i > 0) {
          graphicsContainer.removeChild(child);
        }
      }
    }
  }

  /**
   * Create a circle
   * @param {number} x x-coordinate of the circle center
   * @param {number} y y-coordinate of the circle center
   * @param {number} r radius of the circle
   * @param {boolean} update toggles updating the object via a step() method
   * @param {string} fill the colour of the fill
   * @param {string} stroke the colour of the stroke
   * @return {Circle} a Two.js circle object
   */
  private createCircle(x: number, y: number, r: number, update: boolean, fill = "black", stroke = "black"): Circle {
    const coordinates = translate(x, y, this.viewWidth, this.viewHeight);
    const circle = this.two.makeCircle(coordinates[0], coordinates[1], r);
    circle.fill = getInvertedColor(fill);
    circle.stroke = getInvertedColor(stroke);
    if (update) this.addElement(circle);
    return circle;
  }

  /**
   * Create a rectangle
   * @param {number} x x-coordinate of the rectangle
   * @param {number} y y-coorindate of the rectangle
   * @param {number} w width of the rectangle
   * @param {number} h height of the rectangle
   * @param {boolean} update toggles updating the object via a step() method
   * @param {string} fill the colour of the rectangle
   * @return {Rectangle} a Two.js rectangle object
   */
  private createRectangle(x: number, y: number, w: number, h: number, update: boolean, fill = "black"): Rectangle {
    const coordinates = translate(x, y, w, h);
    const rectangle = this.two.makeRectangle(coordinates[0], coordinates[1], w, h);
    rectangle.fill = getInvertedColor(fill);
    if (update) this.addElement(rectangle);
    return rectangle;
  }

  /**
   * Creates the fixation cross in Two.js
   * @param {number} x x-coordinate of the fixation cross
   * @param {number} y y-coordinate of the fixation cros
   * @param {number} d the width of the fixation cross
   * @param {boolean} update toggles updating the object via a step() method
   * @param {string} fill the colour of the fixation cross
   * @return {Array} array containing two Two.Rectangle objects
   */
  private createFixation(x: number, y: number, d: number, update: boolean, fill = "black"): Rectangle[] {
    const coordinates = translate(x, y, this.viewWidth, this.viewHeight);
    const rectangleHorizontal = this.two.makeRectangle(coordinates[0], coordinates[1], d, d / 4);
    const rectangleVertical = this.two.makeRectangle(coordinates[0], coordinates[1], d / 4, d);
    rectangleHorizontal.fill = getInvertedColor(fill);
    rectangleVertical.fill = getInvertedColor(fill);
    rectangleHorizontal.noStroke();
    rectangleVertical.noStroke();
    if (update) {
      this.addElement(rectangleHorizontal);
      this.addElement(rectangleVertical);
    }
    return [rectangleHorizontal, rectangleVertical];
  }

  /**
   * Add dot to the render layer
   * @param {Dot} dot instance of Dot
   * @param {boolean} update toggles updating the object via a step() method
   * @param {string} fill the colour of the Dot
   * @return {Circle} Two.Circle instance
   */
  private createDot(dot: Dot, update: boolean, fill = "black"): Circle {
    const coordinates = translate(dot.getX(), dot.getY(), this.viewWidth, this.viewHeight);
    const circle = this.two.makeCircle(coordinates[0], coordinates[1], this.dotRadius);
    circle.fill = getInvertedColor(fill);
    dot.setDot(circle);
    this.renderLayer.add(circle);
    if (update) this.addElement(dot);
    return circle;
  }

  /**
   * Create an arc
   * @param {number} startAngle the starting angle of the arc
   * @param {number} endAngle the ending angle of the arc
   * @param {string} fill the colour of the arc
   * @return {ArcSegment} arc object
   */
  private createArc(startAngle: number, endAngle: number, fill = "red"): ArcSegment {
    const coordinates = translate(0, 0, this.viewWidth, this.viewHeight);
    const arc = this.two.makeArcSegment(
      coordinates[0],
      coordinates[1],
      this.apertureRadius,
      this.apertureRadius,
      startAngle,
      endAngle
    );
    arc.stroke = getInvertedColor(fill);
    arc.linewidth = 10;
    this.two.add(arc);
    this.addElement(arc);
    return arc;
  }

  /**
   * Create a line
   * @param {number} x1 starting x-coordinate
   * @param {number} y1 starting y-coordinate
   * @param {number} x2 ending x-coordinate
   * @param {number} y2 ending y-coordinate
   * @param {number} width width of the line
   * @param {string} fill the colour of the line
   * @return {Two.Line} line object
   */
  private createLine(x1: number, y1: number, x2: number, y2: number, width: number, fill = "black"): any {
    const startCoordinates = translate(x1, y1, this.viewWidth, this.viewHeight);
    const endCoordinates = translate(x2, y2, this.viewWidth, this.viewHeight);
    const line = this.two.makeLine(startCoordinates[0], startCoordinates[1], endCoordinates[0], endCoordinates[1]);
    line.stroke = getInvertedColor(fill);
    line.linewidth = width;
    this.two.add(line);
    return line;
  }

  /**
   * Add an image onto the target
   * @param {string} imageType the type of image to add
   */
  private addImage(imageType: string): void {
    if (imageType === "left") {
      // Access the graphics container
      const graphicsCanvasDiv = document.getElementsByClassName("graphics-container")[0];

      // Create the left image container and the left image
      const leftImage = document.createElement("img");
      if (__TARGET__ === "desktop") {
        leftImage.src = this.jsPsych.extensions.Neurocog.getStimulus("F.png");
      } else {
        leftImage.src = this.jsPsych.extensions.Neurocog.getStimulus("2.png");
      }
      leftImage.style.height = "20vh";
      leftImage.style.position = "absolute";
      leftImage.style.paddingRight = "70%";

      // Prepend the left image container to the graphics container
      graphicsCanvasDiv.prepend(leftImage);
    } else if (imageType === "right") {
      // Access the graphics container
      const graphicsCanvasDiv = document.getElementsByClassName("graphics-container")[0];

      // Create the right image container and the right image
      const rightImage = document.createElement("img");
      if (__TARGET__ === "desktop") {
        rightImage.src = this.jsPsych.extensions.Neurocog.getStimulus("J.png");
      } else {
        rightImage.src = this.jsPsych.extensions.Neurocog.getStimulus("3.png");
      }
      rightImage.style.height = "20vh";
      rightImage.style.position = "absolute";
      rightImage.style.paddingLeft = "70%";

      // Prepend the right image container to the graphics container
      graphicsCanvasDiv.append(rightImage);
    } else {
      // Warning unknown
      console.warn(`Unknown image type: '${imageType}'`);
    }
  }

  private addButton(buttonText: string, variant = "default"): HTMLDivElement {
    // Create colorscheme based on variant
    const colorscheme = {
      default: {
        background: "#88919e",
        fill: "#575d66",
      },
      orangeDark: {
        background: "#ffc20a",
        fill: "#ffdb6e",
      },
      orangeLight: {
        background: "#ffd75e",
        fill: "#fce7a9",
      },
      blueDark: {
        background: "#1792fc",
        fill: "#47a8fc",
      },
      blueLight: {
        background: "#7bbef8",
        fill: "#9dd0fc",
      },
    };

    // Create container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.alignItems = "center";
    buttonContainer.style.width = "140px";
    buttonContainer.style.height = "60px";
    buttonContainer.style.padding = "4px";
    buttonContainer.style.borderRadius = "8px";
    buttonContainer.style.backgroundColor = colorscheme[variant].background;
    buttonContainer.style.position = "relative";
    buttonContainer.style.overflow = "hidden";

    // Create progress bar
    const progressBar = document.createElement("div");
    progressBar.style.position = "absolute";
    progressBar.style.bottom = "0";
    progressBar.style.left = "0";
    progressBar.style.width = "0%";
    progressBar.style.height = "100%";
    progressBar.style.backgroundColor = colorscheme[variant].fill;
    progressBar.className = "progress-bar";
    buttonContainer.appendChild(progressBar);

    // Add label text for the button
    const buttonLabel = document.createElement("p");
    buttonLabel.textContent = buttonText;
    buttonLabel.style.fontWeight = "bold";
    buttonLabel.style.fontSize = "x-large";
    buttonLabel.style.position = "relative";
    buttonLabel.style.zIndex = "1";
    buttonLabel.style.color = "black";
    buttonContainer.appendChild(buttonLabel);

    return buttonContainer;
  }

  /**
   * Set the progress displayed on a selection button
   * @param {string} selection Selected option, in `<confidence>_<direction>` format
   * @param {number} progress Percentage expressed between 0 and 100
   */
  setButtonProgress(selection: SelectionOptions, progress: number): void {
    const buttonElement = document.querySelector(`[data-button-id="${selection}"]`);
    if (buttonElement) {
      const progressBar = buttonElement.querySelector(".progress-bar") as HTMLElement;
      if (progressBar) {
        progressBar.style.width = `${progress.toString()}%`;
      }
    }
  };

  /**
   * Add a label onto the target
   * @param {string} labelType the type of label to add
   */
  private addLabel(labelType: string): void {
    if (labelType === "left") {
      // Access the graphics container
      const graphicsCanvasDiv = document.getElementsByClassName("graphics-container")[0];

      // Create the left container
      const leftContainer = document.createElement("div");
      leftContainer.id = "left-container";
      leftContainer.style.display = "flex";
      leftContainer.style.flexDirection = "column";
      leftContainer.style.alignItems = "center";
      leftContainer.style.justifyContent = "center";
      leftContainer.style.position = "absolute";
      leftContainer.style.marginRight = "70%";

      // Left label
      const leftLabel = document.createElement("p");
      leftLabel.textContent = "Left";
      leftLabel.style.fontSize = "xx-large";
      leftLabel.style.fontWeight = "bold";
      leftContainer.append(leftLabel);

      // Create the left button container
      const leftButtonContainer = document.createElement("div");
      leftButtonContainer.style.display = "flex";
      leftButtonContainer.style.justifyContent = "center";
      leftButtonContainer.style.alignItems = "center";
      leftButtonContainer.style.flexDirection = "row";
      leftButtonContainer.style.gap = "16px";
      leftContainer.append(leftButtonContainer);

      // Left "Very Confident" button
      const leftVeryConfidentButtonContainer = document.createElement("div");
      leftVeryConfidentButtonContainer.style.display = "flex";
      leftVeryConfidentButtonContainer.style.justifyContent = "center";
      leftVeryConfidentButtonContainer.style.alignItems = "center";
      leftVeryConfidentButtonContainer.style.flexDirection = "column";
      leftVeryConfidentButtonContainer.style.gap = "16px";
      const leftVeryConfidentButton = this.addButton("Very Confident", "orangeDark");
      leftVeryConfidentButton.setAttribute("data-button-id", "vc_l");
      leftVeryConfidentButtonContainer.append(leftVeryConfidentButton);
      const leftVeryConfidentButtonLabelContainer = document.createElement("div");
      if (__TARGET__ === "spectrometer") {
        leftVeryConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("1", true);
      } else {
        leftVeryConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("D");
      }
      leftVeryConfidentButtonContainer.append(leftVeryConfidentButtonLabelContainer);
      leftButtonContainer.append(leftVeryConfidentButtonContainer);

      // Left "Somewhat Confident" button
      const leftSomewhatConfidentButtonContainer = document.createElement("div");
      leftSomewhatConfidentButtonContainer.style.display = "flex";
      leftSomewhatConfidentButtonContainer.style.justifyContent = "center";
      leftSomewhatConfidentButtonContainer.style.alignItems = "center";
      leftSomewhatConfidentButtonContainer.style.flexDirection = "column";
      leftSomewhatConfidentButtonContainer.style.gap = "16px";
      const leftSomewhatConfidentButton = this.addButton("Somewhat Confident", "orangeLight");
      leftSomewhatConfidentButton.setAttribute("data-button-id", "sc_l");
      leftSomewhatConfidentButtonContainer.append(leftSomewhatConfidentButton);
      const leftSomewhatConfidentButtonLabelContainer = document.createElement("div");
      if (__TARGET__ === "spectrometer") {
        leftSomewhatConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("2", true);
      } else {
        leftSomewhatConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("F");
      }
      leftSomewhatConfidentButtonContainer.append(leftSomewhatConfidentButtonLabelContainer);
      leftButtonContainer.append(leftSomewhatConfidentButtonContainer);

      // Prepend the left label container to the graphics container
      graphicsCanvasDiv.prepend(leftContainer);
    } else if (labelType === "right") {
      // Access the graphics container
      const graphicsCanvasDiv = document.getElementsByClassName("graphics-container")[0];

      // Create the right container
      const rightContainer = document.createElement("div");
      rightContainer.id = "right-container";
      rightContainer.style.display = "flex";
      rightContainer.style.flexDirection = "column";
      rightContainer.style.alignItems = "center";
      rightContainer.style.justifyContent = "center";
      rightContainer.style.position = "absolute";
      rightContainer.style.marginLeft = "70%";

      // Right label
      const rightLabel = document.createElement("p");
      rightLabel.textContent = "Right";
      rightLabel.style.fontSize = "xx-large";
      rightLabel.style.fontWeight = "bold";
      rightContainer.append(rightLabel);

      // Create the right button container
      const rightButtonContainer = document.createElement("div");
      rightButtonContainer.style.display = "flex";
      rightButtonContainer.style.justifyContent = "center";
      rightButtonContainer.style.alignItems = "center";
      rightButtonContainer.style.flexDirection = "row";
      rightButtonContainer.style.gap = "16px";
      rightContainer.append(rightButtonContainer);

      // Right "Somewhat Confident" button
      const rightSomewhatConfidentButtonContainer = document.createElement("div");
      rightSomewhatConfidentButtonContainer.style.display = "flex";
      rightSomewhatConfidentButtonContainer.style.justifyContent = "center";
      rightSomewhatConfidentButtonContainer.style.alignItems = "center";
      rightSomewhatConfidentButtonContainer.style.flexDirection = "column";
      rightSomewhatConfidentButtonContainer.style.gap = "16px";
      const rightSomewhatConfidentButton = this.addButton("Somewhat Confident", "blueLight");
      rightSomewhatConfidentButton.setAttribute("data-button-id", "sc_r");
      rightSomewhatConfidentButtonContainer.append(rightSomewhatConfidentButton);
      const rightSomewhatConfidentButtonLabelContainer = document.createElement("div");
      if (__TARGET__ === "spectrometer") {
        rightSomewhatConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("3", true);
      } else {
        rightSomewhatConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("J");
      }
      rightSomewhatConfidentButtonContainer.append(rightSomewhatConfidentButtonLabelContainer);
      rightButtonContainer.append(rightSomewhatConfidentButtonContainer);

      // Right "Very Confident" button
      const rightVeryConfidentButtonContainer = document.createElement("div");
      rightVeryConfidentButtonContainer.style.display = "flex";
      rightVeryConfidentButtonContainer.style.justifyContent = "center";
      rightVeryConfidentButtonContainer.style.alignItems = "center";
      rightVeryConfidentButtonContainer.style.flexDirection = "column";
      rightVeryConfidentButtonContainer.style.gap = "16px";
      const rightVeryConfidentButton = this.addButton("Very Confident", "blueDark");
      rightVeryConfidentButton.setAttribute("data-button-id", "vc_r");
      rightVeryConfidentButtonContainer.append(rightVeryConfidentButton);
      const rightVeryConfidentButtonLabelContainer = document.createElement("div");
      if (__TARGET__ === "spectrometer") {
        rightVeryConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("4", true);
      } else {
        rightVeryConfidentButtonLabelContainer.innerHTML = Graphics.getInputIcon("K");
      }
      rightVeryConfidentButtonContainer.append(rightVeryConfidentButtonLabelContainer);
      rightButtonContainer.append(rightVeryConfidentButtonContainer);

      // Append the right label container to the graphics container
      graphicsCanvasDiv.append(rightContainer);
    } else {
      // Warning unknown
      console.warn(`Unknown label type: '${labelType}'`);
    }
  }

  /**
   * Generate and and return a HTML string depicting the controller layout with the
   * specified button index highlighted.
   * @param {String} keycode Keycode of the input to be represented
   * @param {Boolean} isController Optional parameter to specify if the SVG should represent a controller
   * @return {string} the HTML string for the controller button representation
   */
  static getInputIcon(keycode: string, isController = false): string {
    if (isController) {
      // Constrain button index (1-4)
      const numericKeycode = parseInt(keycode);
      const buttonIndex = Math.max(1, Math.min(4, numericKeycode));

      // Create SVG with 4 circles representing the controller buttons
      const svg = `
        <svg width="90" height="45" style="display: inline-block; vertical-align: middle;">
          <rect x="2" y="2" width="86" height="41"
                fill="none" stroke="black" stroke-width="2"
                rx="4" ry="4"/>
          ${[1, 2, 3, 4]
            .map((index) => {
              const centerX = 18 * index;
              const centerY = 22.5;
              const radius = 6;
              const isHighlighted = index === buttonIndex;

              return `
              <circle cx="${centerX}" cy="${centerY}" r="${radius}"
                      fill="${isHighlighted ? "red" : "none"}"
                      stroke="${getInvertedColor("black")}" stroke-width="1"/>
            `;
            })
            .join("")}
        </svg>
      `;

      return svg;
    } else {
      // Create SVG with a rounded square containing the keycode
      const svg = `
        <svg width="60" height="60" style="display: inline-block; vertical-align: middle;">
          <rect x="2" y="2" width="56" height="56"
                fill="none" stroke="black" stroke-width="2"
                rx="5" ry="5"/>
          <text x="30" y="38" text-anchor="middle"
                font-family="Arial, sans-serif"
                font-size="20"
                font-weight="bold"
                fill="black">${keycode}</text>
        </svg>
      `;

      return svg;
    }
  }
}
