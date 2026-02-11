// Class imports for type definitions
import Two from "two.js";
import { Graphics } from "../src/classes/Graphics";

// Global keyup handler for decision input
declare global {
  interface Window {
    decisionKeyUpHandler?: (event: KeyboardEvent) => void;
    postDecisionKeyUpHandler?: (event: KeyboardEvent) => void;
  }
}

export type SelectionOptions = "vc_l" | "sc_l" | "sc_r" | "vc_r";

// Data frame
export type IData = {
  trialName: string;
  trialNumber: number;
  score: number;
  trialStart: number;
  trialEnd: number;
  trialDuration: number;
  decisionStart: number;
  decisionEnd: number;
  decisionDuration: number;
  motionDuration: number;
  selection: SelectionOptions;
  correct: 0 | 1;
  activeCoherence: number;
  coherences: number[];
};

// Graphics parameters
export type GraphicsParameters = {
  displayElement: HTMLElement;
  two: Two;
  distanceFromScreen: number;
  // View dimensions
  viewWidth: number;
  viewHeight: number;
  // Stimuli dimensions
  apertureRadius: number;
  dotRadius: number;
};

// Dot parameters
export type DotParameters = {
  type: "reference" | "random";
  viewWidth: number;
  viewHeight: number;
  apertureRadius: number;
  dotVelocity: number;
  dotRadius: number;
  dotAngle: number;
};

// Stimulus parameters
export type IStimulus = {
  name: string;
  interactive: boolean;
  keybindings?: any;
  components: string[];
  timing: any;
  two: Two;
  graphics: Graphics;
  eventHandler: (event: KeyboardEvent) => void;
  postTrialHandler: () => void;
};

// Keyboard layout
export type IKeys = {
  name: string;
  left: string;
  right: string;
  alt: string;
  submit: string;
  showButtons: boolean;
};
