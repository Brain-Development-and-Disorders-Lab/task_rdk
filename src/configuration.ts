/**
 * @summary Configuration file for Bang et al. RDK task.
 *
 * @description Contains specific parameters used in the Bang et al. RDK task,
 * contains the number of trials and different key layouts.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/rdk/src/config.ts
 * @author Henry Burgess <s4481993@student.uq.edu.au>
 */

// List of targets
enum Targets {
  GORILLA = "gorilla",
  DESKTOP = "desktop",
  SPECTROMETER = "spectrometer",
}

// Specify the build target here
const TARGET = Targets.DESKTOP;

export const configuration = {
  name: "Moving dots",
  studyName: "bang_2018_decision_confidence",
  localisation: "en-AU",
  contact: "henry.burgess@wustl.edu",
  allowParticipantContact: false,
  target: TARGET,

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
      left: "Digit2",
      right: "Digit3",
      alt: "Digit1",
      submit: "Digit4",
      trigger: "Digit5",
      showButtons: false,
    },
  },
  keys: "desktop",

  manipulations: {
    numTutorialTrials: 10,
    numPracticeTrials: 10,
    numCalibrationOneTrials: 120,
    numMainTrials: 200,
    requireID: true,
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
