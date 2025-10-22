import DotGamePlugin from "../src/plugin";

export type RDKTrial = {
  type: DotGamePlugin;
  name: string;
  distance: number;
  coherence: number;
  stimulusDuration: number;
  dotDirection: number;
  dotVelocity: number;
  showFeedback: boolean;
  keyLayout: IKeys;
  data: {
    name: string;
    number: number;
    coherence: number;
    stimulusDuration: number;
    dotDirection: number;
    selection: "vc_l" | "sc_l" | "sc_r" | "vc_r";
    deviation: "left" | "right";
    correct: boolean;
  };
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
  direction: number;
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
