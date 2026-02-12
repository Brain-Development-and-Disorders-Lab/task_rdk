// Class imports for type definitions
import Two from "two.js";
import { Graphics } from "../src/classes/Graphics";

// Collection of selection options, specifying confidence level and direction
export type SelectionOptions = "vc_l" | "sc_l" | "sc_r" | "vc_r";

// Data frame
export type IData = {
  trialType: string;
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

// Button configuration type, used to specify the mapping of
// specific input keycodes
export type IButtonMap = {
  "1": string; // Typically the left-most input
  "2": string;
  "3": string;
  "4": string; // Typically the right-most input
  trigger?: string; // Optional "trigger" input used in MRI contexts
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
  stimulusName: string;
  stimulusComponents: string[];
  stimulusTiming: {
    pre: number;
    run: number;
    post: number;
  };
  isInteractive: boolean;
  two: Two;
  graphics: Graphics;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onStimulusEnd?: () => void;
};
