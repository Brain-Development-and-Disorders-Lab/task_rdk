/**
 * @file Extension of the 'Window' interface.
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// 'Experiment' jsPsych wrapper library
import { Experiment } from "neurocog";

// Add 'Experiment' to the global Window interface
declare global {
  interface Window {
    Experiment: Experiment;
  }
}
