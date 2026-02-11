// Class imports for type definitions
import Two from "two.js";
import { Graphics } from "../src/classes/Graphics";
import { Renderer } from "../src/classes/Renderer";

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

// Renderer parameters
export type IRenderer = {
  distanceFromScreen: number;
  viewRadius: number;
  dotRadius: number;
  width: number;
  height: number;
  target: HTMLElement;
};

// Dot parameters
export type IDot = {
  type: string;
  width: number;
  height: number;
  viewRadius: number;
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
  renderer: Renderer,
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
