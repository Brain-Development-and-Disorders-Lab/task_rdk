/**
 * @summary Timeline configuration of RDK task
 *
 * @Description Constructs the timeline of the task using a variety of
 * plugins.
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/index.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */
// Import jsPsych to ensure it is bundled when compiled
import { initJsPsych } from "jspsych";
import InstructionsPlugin from "@jspsych/plugin-instructions";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import SurveyHtmlFormPlugin from "@jspsych/plugin-survey-html-form";
// NOTE: Removed for testing new MRI controllers on November 26, 2023
// import jsPsychAttentionCheck from "jspsych-attention-check";
import DotGamePlugin from "./plugin";
import NeurocogExtension from "neurocog";

// Graphics class, used to generate stimuli
import { Graphics } from "./classes/Graphics";

// Custom types
import { IButtonMap } from "../types";

// Additional functions and variables
import _ from "lodash";
import { scaling } from "./functions";

/**
 * Initialize jsPsych
 */
const jsPsych = initJsPsych({
  on_finish: () => {
    jsPsych.data.get().localSave("csv", `rdk_task_${Date.now()}.csv`);
  },
  extensions: [
    {
      type: NeurocogExtension,
      params: {
        name: "RDK Task",
        studyName: "task_rdk",
        allowParticipantContact: false,
        contact: "henry.burgess@wustl.edu",
        seed: 0.3723,
      },
    },
  ],
});

// Configure variable alias for Neurocog extension
const Neurocog = jsPsych.extensions.Neurocog;

/**
 * Define the input configuration, change this to suit the context
 * using the `IButtonMap` type. Buttons "1" through "4" are required,
 * and "trigger" is optional except for MRI contexts.
 * Example format for MRI contexts:
 *
 * ```typescript
 * const buttonMap: IButtonMap = {
 *   1: "1",
 *   2: "2",
 *   3: "3",
 *   4: "4",
 *   trigger: "5",
 * };
 * ```
 */
const buttonMapDesktop: IButtonMap = {
  1: "d",
  2: "f",
  3: "j",
  4: "k",
  trigger: "",
};
const buttonMapSpectrometer: IButtonMap = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  trigger: "5",
};

// Set input configuration based on delivery target
const buttonMap = _.isEqual(__TARGET__, "spectrometer") ? buttonMapSpectrometer : buttonMapDesktop;

// Experimental parameters, defining the number of trials and other experiment behavior
export const Manipulations = {
  numTutorialTrials: Neurocog.getManipulation("numTutorialTrials", 8),
  numPracticeTrials: Neurocog.getManipulation("numPracticeTrials", 8),
  numCalibrationOneTrials: Neurocog.getManipulation("numCalibrationOneTrials", 60),
  numMainTrials: Neurocog.getManipulation("numMainTrials", 100),
  invertColors: _.isEqual(__TARGET__, "spectrometer"),
  requireID: Neurocog.getManipulation("requireID", false),
  enableFullscreen: _.isEqual(__TARGET__, "spectrometer"),
  showInstructions: Neurocog.getManipulation("showInstructions", false),
};

// Apply color inversion
if (Manipulations.invertColors) {
  document.body.classList.add("inverted");
}

/**
 * Create the experiment timeline
 */
const timeline = [];

// Tutorial trial properties
const tutorialDuration = [1, 5];
const tutorialCoherences = [0.3, 0.6];

// Practice trial properties
const practiceCoherences = [0.3, 0.6];

// Require the ID input
if (_.isEqual(Manipulations.requireID, true)) {
  timeline.push({
    type: SurveyHtmlFormPlugin,
    preamble: `<p>Please enter the 8 digit participant LUID.</p>`,
    html: `<input name="participantIdentifier" type="text" required /></br></br>`,
  });
}

// Run in fullscreen mode
if (_.isEqual(Manipulations.enableFullscreen, true)) {
  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: true,
    message: `<p>Enable fullscreen to continue.</p>`,
  });
}

// -------------------- Instructions --------------------
let instructionContinueText = `<div id="instructions-navigation">
    <hr>
    <div style="display: flex; flex-direction: row; justify-content: space-between;">
      <div style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
        <p style="font-weight: bold; font-size: large;">\< Back</p>
        ${_.isEqual(__TARGET__, "spectrometer") ? Graphics.getInputIcon("1", true) : Graphics.getInputIcon("F")}
      </div>
      <div style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
        ${_.isEqual(__TARGET__, "spectrometer") ? Graphics.getInputIcon("4", true) : Graphics.getInputIcon("J")}
        <p style="font-weight: bold; font-size: large;">Next \></p>
      </div>
    </div>
  </div>`;

if (_.isEqual(Manipulations.showInstructions, true) && !_.isEqual(__TARGET__, "spectrometer")) {
  // Display video
  timeline.push({
    type: InstructionsPlugin,
    pages: [
      `<h1>RDK Task</h1>
      <h2>Instructions - Video</h2>
      <iframe src="https://wustl.box.com/embed/v/rdk-instructions-video" class="video-container" frameborder="0" allowfullscreen webkitallowfullscreen msallowfullscreen></iframe>
      <p><i>This video is best viewed in fullscreen mode.</i></p>` + instructionContinueText,
    ],
    allow_keys: false,
    key_forward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["4"] : buttonMap["3"],
    key_backward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["1"] : buttonMap["2"],
    show_page_number: true,
    show_clickable_nav: false,
  });
}

// -------------------- Tutorial trials --------------------
const tutorialGames = [
  `<h1>RDK Task</h1>` +
    `<h2>Practice Games</h2>` +
    `<p>Play a few games now and practice watching the dots while ` +
    `observing the appearance of the game.</p>` +
    `<p>Use the buttons associated with the prompts to interact with the game.</p>` +
    instructionContinueText,
];

timeline.push({
  type: InstructionsPlugin,
  pages: tutorialGames,
  allow_keys: true,
  key_forward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["4"] : buttonMap["3"],
  key_backward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["1"] : buttonMap["2"],
  show_page_number: true,
  show_clickable_nav: false,
});

for (let t = 0; t < Manipulations.numTutorialTrials; t++) {
  let d = (Math.random() * (tutorialDuration[1] - tutorialDuration[0]) + tutorialDuration[0]) * 1000;
  d = parseFloat(d.toFixed(2));
  const k = Math.random() > 0.5 ? tutorialCoherences[0] : tutorialCoherences[1];
  let a = Math.random() > 0.5 ? 0 : Math.PI;
  a = parseFloat(a.toFixed(3));

  const trial = {
    type: DotGamePlugin,
    trialType: "tutorial",
    trialNumber: t,
    viewDistance: 50 * scaling(),
    dotAngle: a,
    dotVelocity: 2.0,
    dotDirection: a === 0 ? "right" : "left",
    activeCoherence: k,
    coherences: [k, k],
    motionDuration: d,
    showFeedback: false,
    buttonMap: buttonMap,
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// -------------------- Practice trials --------------------
const practice = [
  `<h1>RDK Task</h1>` +
    `<h2>Practice Games</h2>` +
    `<p>You will now play another ${Manipulations.numPracticeTrials} ` +
    `practice games. ` +
    `You will be shown if your answer was correct or not.</p>` +
    `<p>If your answer was correct, the cross in the ` +
    `middle of the screen will briefly turn green.</p>` +
    `<p>If your answer was wrong, the cross in the ` +
    `middle of the screen will briefly turn red.</p>` +
    instructionContinueText,
];

timeline.push({
  type: InstructionsPlugin,
  pages: practice,
  allow_keys: true,
  key_forward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["4"] : buttonMap["3"],
  key_backward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["1"] : buttonMap["2"],
  show_page_number: true,
  show_clickable_nav: false,
});

// Attention-check question
// NOTE: Removed for testing new MRI controllers on November 26, 2023

for (let t = 0; t < Manipulations.numPracticeTrials; t++) {
  let a = Math.random() > 0.5 ? 0 : Math.PI;
  a = parseFloat(a.toFixed(3));
  const k = Math.random() > 0.5 ? practiceCoherences[0] : practiceCoherences[1];

  const trial = {
    type: DotGamePlugin,
    trialType: "practice",
    trialNumber: t,
    viewDistance: 50 * scaling(),
    dotAngle: a,
    dotVelocity: 2.0,
    dotDirection: a === 0 ? "right" : "left",
    activeCoherence: k,
    coherences: [k, k],
    motionDuration: 1500,
    showFeedback: true,
    buttonMap: buttonMap,
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// -------------------- Calibration trials --------------------
const main = [];

if (Manipulations.numCalibrationOneTrials + Manipulations.numMainTrials > 0) {
  main.push(
    `<h1>RDK Task</h1>` +
      `<p>That concludes all the practice games.</p>` +
      `<p>Take a short break now.</p>` +
      `<p>When you are ready to continue, you will play ` +
      `${Manipulations.numCalibrationOneTrials + Manipulations.numMainTrials} ` +
      `games.</p>` +
      `<br>` +
      `<p><b>Good luck!</b></p>` +
      instructionContinueText
  );
} else {
  // Training setup with no calibration or main trials
  main.push(
    `<h1>RDK Task</h1>` +
      `<p>That concludes all the practice games.</p>` +
      `<p>When you are ready, press <b>Right</b> to continue with the main games.</p>` +
      instructionContinueText
  );
}

// Attention-check question
// November 26, 2023: Removed for testing new MRI controllers

// -------------------- Spectrometer --------------------
// If inside the spectrometer, wait until the signal key is pressed.
// Else, use the standard pre-game screen.
if (_.isEqual(__TARGET__, "spectrometer")) {
  const spectrometer = [
    `<h1>RDK Task</h1>` +
      `<h2>Please Wait...</h2>` +
      `<p>You have now completed all of the practice games.</p>` +
      `<p>Waiting for spectrometer to be ready.</p>` +
      `<p>When this page changes, the games will commence.</p>` +
      `<p><b>Good luck!</b></p>`,
  ];

  timeline.push({
    type: InstructionsPlugin,
    pages: spectrometer,
    allow_keys: true,
    key_forward: buttonMap["trigger"],
    show_clickable_nav: false,
  });
} else {
  timeline.push({
    type: InstructionsPlugin,
    pages: main,
    allow_keys: true,
    key_forward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["4"] : buttonMap["3"],
    key_backward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["1"] : buttonMap["2"],
    show_page_number: true,
    show_clickable_nav: false,
  });
}

// -------------------- Phase one calibration trials --------------------
for (let t = 0; t < Manipulations.numCalibrationOneTrials; t++) {
  const k = 0.2;
  let a = Math.random() > 0.5 ? 0 : Math.PI;
  a = parseFloat(a.toFixed(3));

  const trial = {
    type: DotGamePlugin,
    trialType: t === 0 || t === 1 ? "calibration-constant" : "calibration",
    trialNumber: t,
    viewDistance: 50 * scaling(),
    dotAngle: a,
    dotVelocity: 2.0,
    dotDirection: a === 0 ? "right" : "left",
    activeCoherence: k,
    coherences: [k, k],
    motionDuration: 1500,
    showFeedback: false,
    buttonMap: buttonMap,
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// Attention-check question
// November 26, 2023: Removed for testing new MRI controllers

// -------------------- Main trials --------------------
for (let t = 0; t < Manipulations.numMainTrials; t++) {
  const k = 0.2;
  let a = Math.random() > 0.5 ? 0 : Math.PI;
  a = parseFloat(a.toFixed(3));

  const trial = {
    type: DotGamePlugin,
    trialType: "main",
    trialNumber: t,
    viewDistance: 50 * scaling(),
    dotAngle: a,
    dotVelocity: 2.0,
    dotDirection: a === 0 ? "right" : "left",
    activeCoherence: k,
    coherences: [k, k],
    motionDuration: 1500,
    showFeedback: false,
    buttonMap: buttonMap,
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// Add end screen to the experiment
const end =
  `<h1>RDK Task</h1>` +
  `<h2>Task finished</h2>` +
  `<p>Thank you for your participation in this research.</p>`;

timeline.push({
  type: InstructionsPlugin,
  pages: [end],
  allow_backward: false,
  button_label_next: "Finish",
  show_clickable_nav: false,
  key_forward: _.isEqual(__TARGET__, "spectrometer") ? buttonMap["4"] : buttonMap["3"],
});

jsPsych.run(timeline);
