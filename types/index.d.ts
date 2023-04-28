import { Configuration } from "neurocog/types";

// Renderer parameters
export type RenderParameters = {
  distanceFromScreen: number;
  viewRadius: number;
  dotRadius: number;
  width: number;
  height: number;
  target: HTMLElement;
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

// Configuration type
export type IConfiguration = Configuration & {
  layouts: {
    desktop: IKeys;
    spectrometer: IKeys & {
      trigger: string;
    };
  };

  [key: string]: any;
};
