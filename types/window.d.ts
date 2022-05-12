import { Experiment } from "neurocog";

// Add Experiment to the global Window interface
declare global {
  interface Window {
    Experiment: Experiment;
  }
}
