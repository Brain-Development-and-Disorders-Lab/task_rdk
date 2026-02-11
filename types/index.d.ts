// Global keyup handler for decision input
declare global {
  interface Window {
    decisionKeyUpHandler?: (event: KeyboardEvent) => void;
    postDecisionKeyUpHandler?: (event: KeyboardEvent) => void;
  }
}

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
  selected: any;
  keybindings?: any;
  timing: any;
  target: any;
  trial: any;
  postTrialHandler: any;
  rendererParameters: IRenderer;
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
