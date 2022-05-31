// Core modules
import { Renderer } from "../Runtime";

/**
 * Dot class used to abstract the positioning of moving dots.
 */
export class Dot {
  private x: number;
  private y: number;
  private shown: boolean;
  private type: any;
  private width: number;
  private height: number;
  private viewRadius: number;
  private dotVelocity: number;
  private dotRadius: number;
  private reference: number;
  private direction: any;
  private dot: any;
  private stuck: boolean;
  /**
   * Dot class constructor
   * @param {number} x the x cartesian coordinate of the dot
   * @param {number} y the y cartesian coordinate of the dot
   * @param {*} parameters a parameters object containing properties
   */
  constructor(x: number, y: number, parameters: any) {
    this.x = x;
    this.y = y;
    this.shown = false;
    this.type = parameters.type;
    this.width = parameters.width;
    this.height = parameters.height;
    this.viewRadius = parameters.viewRadius;
    this.dotVelocity = parameters.dotVelocity;
    this.dotRadius = parameters.dotRadius;
    this.reference = parameters.reference;
    this.direction = parameters.direction;
    this.dot = null;
    this.stuck = false;
  }

  /**
   * Set the corresponding two.js object
   * @param {any} dot intance of two.js circle
   */
  setDot(dot: any): void {
    this.dot = dot;
  }

  /**
   * Get the x position of the dot
   * @return {number} x position
   */
  getX(): number {
    return this.x;
  }

  /**
   * Get the y position of the dot
   * @return {number} y position
   */
  getY(): number {
    return this.y;
  }

  /**
   * Get the type of dot
   * @return {string} the dot type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Generic step method that is called sixty times per second
   * @param {number} frameCount the number of elapsed frames
   */
  step(frameCount: number): void {
    let x = this.x;
    let y = this.y;

    if (this.type === "reference") {
      // Check if the dot is currently visible within the circle.
      if (Math.sqrt(x ** 2 + y ** 2) < this.viewRadius) {
        this.shown = true;
      }

      // Check if the new coordinates are within region.
      if (
        !Renderer.visible(x, y, this.viewRadius + this.dotRadius * 2) &&
        this.shown === true
      ) {
        x = x - 2 * this.viewRadius * Math.cos(this.direction);
        y = y - 2 * this.viewRadius * Math.sin(this.direction);
        this.shown = false;
      }
    } else if (this.type === "random") {
      if (frameCount % 6 === 0) {
        const delta = Math.random();
        if (delta > 0.5) {
          this.direction -= (Math.PI / 8) * delta;
        } else {
          this.direction += (Math.PI / 8) * delta;
        }
      }

      if (!Renderer.visible(x, y, this.viewRadius)) {
        x = -x;
        y = -y;
      }
    }

    // Modify the dot position.
    x = x + this.dotVelocity * Math.cos(this.direction);
    y = y + this.dotVelocity * Math.sin(this.direction);
    this.x = x;
    this.y = y;

    // Perform coordinate translate for renderer, only if dot is within the view
    const coordinates = Renderer.translate(
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (
      Renderer.renderable(
        coordinates[0],
        coordinates[1],
        this.width,
        this.height
      )
    ) {
      this.dot.translation.x = coordinates[0];
      this.dot.translation.y = coordinates[1];
    }
  }
}
