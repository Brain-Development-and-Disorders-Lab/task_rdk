/**
 * @summary Configuration file for Bang et al. RDK task.
 *
 * @description Contains specific parameters used in the Bang et al. RDK task,
 * contains the number of trials and different key layouts.
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/configuration.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

export const configuration = {
  name: "RDK Task",
  studyName: "bang_2018_decision_confidence",
  localisation: "en-AU",
  contact: "henry.burgess@wustl.edu",
  allowParticipantContact: false,
  target: __TARGET__,

  // -------------------- Scaling --------------------
  scalingDefault: 1.0,

  // -------------------- Style constants --------------------
  style: {
    image: `max-height: 40vh; width: 60vw;`,
    controls: `width: 90vw`,
    keyboard:
      `vertical-align:middle; height: 10vh; ` + `width: auto; margin: 5%;`,
  },

  // -------------------- Key Bindings --------------------
  layouts: {
    desktop: {
      name: "desktop",
      left: "f",
      right: "j",
      alt: "d",
      submit: "k",
      showButtons: false,
    },
    spectrometer: {
      name: "spectrometer",
      left: "2",
      right: "3",
      alt: "1",
      submit: "4",
      trigger: "5",
      showButtons: false,
    },
  },
  keys: __TARGET__,

  manipulations: {
    numTutorialTrials: 10,
    numPracticeTrials: 10,
    numCalibrationOneTrials: 120,
    numMainTrials: 200,
    requireID: false,
    demoMode: false,
  },

  seed: 0.3723,

  // -------------------- Images --------------------
  stimuli: {
    "ControlsConfidenceDesktop.png": "img/ControlsConfidenceDesktop.png",
    "ControlsConfidenceSpectrometer.png":
      "img/ControlsConfidenceSpectrometer.png",
    "ControlsReferenceDesktop.png": "img/ControlsReferenceDesktop.png",
    "ControlsReferenceSpectrometer.png":
      "img/ControlsReferenceSpectrometer.png",
    "ControlsReferenceDesktopReverse.png":
      "img/ControlsReferenceDesktopReverse.png",
    "ControlsReferenceSpectrometerReverse.png":
      "img/ControlsReferenceSpectrometerReverse.png",
    "ControlsNavigationDesktop.png": "img/ControlsNavigationDesktop.png",
    "ControlsNavigationSpectrometer.png":
      "img/ControlsNavigationSpectrometer.png",
    "ControlsQuestionDesktop.png": "img/ControlsQuestionDesktop.png",
    "ControlsQuestionSpectrometer.png": "img/ControlsQuestionSpectrometer.png",
    "InstructionsConfidence.png": "img/InstructionsConfidence.png",
    "InstructionsReference.png": "img/InstructionsReference.png",
    "InstructionsDots.png": "img/InstructionsDots.png",
    "InstructionsMovingDots.gif": "img/InstructionsMovingDots.gif",
    "1.png": "img/1.png",
    "2.png": "img/2.png",
    "3.png": "img/3.png",
    "4.png": "img/4.png",
    "D.png": "img/D.png",
    "F.png": "img/F.png",
    "J.png": "img/J.png",
    "K.png": "img/K.png",
  },
  resources: {},

  // -------------------- Developer settings --------------------
  testing: false,
  showInstructions: false,
};
