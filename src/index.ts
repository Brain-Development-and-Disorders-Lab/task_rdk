/**
 * @summary Timeline configuration of RDK task
 *
 * @Description Constructs the timeline of the task using a variety of
 * plugins.
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/index.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */
// Utility libraries
import _ from "lodash";
import i18next from "i18next";

// Import jsPsych to ensure it is bundled when compiled
import { initJsPsych } from "jspsych";
import InstructionsPlugin from "@jspsych/plugin-instructions";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import SurveyHtmlFormPlugin from "@jspsych/plugin-survey-html-form";

// Attention check plugin
// November 26, 2023: Removed for testing new MRI controllers
// import jsPsychAttentionCheck from "jspsych-attention-check";

// Neurocog extension
import NeurocogExtension from "neurocog";

// Import the plugin before adding it to the timeline
import DotGamePlugin from "./plugin";

// Additional functions and variables
import { scaling } from "./functions";
import { Renderer } from "./classes/Renderer";

// Load translations
import * as en_us from "../locales/en-us.json";
i18next.init({
  lng: "en",
  debug: true,
  resources: {
    en: en_us,
  },
});

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

// Input configurations, mapping device inputs to task actions
const InputConfigurations = {
  desktop: {
    name: "desktop",
    left: "f",
    right: "j",
    submit: "k",
    alt: "d",
    showButtons: false,
  },
  spectrometer: {
    name: "spectrometer",
    left: "4",
    right: "1",
    submit: "2",
    alt: "3",
    trigger: "5",
    showButtons: false,
  },
};

// Experimental parameters, defining the number of trials and other experiment behavior
export const Manipulations = {
  numTutorialTrials: jsPsych.extensions.Neurocog.getManipulation(
    "numTutorialTrials",
    10
  ),
  numPracticeTrials: jsPsych.extensions.Neurocog.getManipulation(
    "numPracticeTrials",
    10
  ),
  numCalibrationOneTrials: jsPsych.extensions.Neurocog.getManipulation(
    "numCalibrationOneTrials",
    120
  ),
  numMainTrials: jsPsych.extensions.Neurocog.getManipulation(
    "numMainTrials",
    200
  ),
  invertColors: __TARGET__ === "spectrometer",
  requireID: jsPsych.extensions.Neurocog.getManipulation("requireID", false),
  enableFullscreen: __TARGET__ === "spectrometer",
  showInstructions: jsPsych.extensions.Neurocog.getManipulation(
    "showInstructions",
    false
  ),
};

// Apply color inversion
if (Manipulations.invertColors) {
  document.body.classList.add("inverted");
}

/**
 * Create the experiment timeline
 */
const timeline = [];

const keyLayout = InputConfigurations[__TARGET__];

// Tutorial trial properties
const tutorialDuration = [1, 5];
const tutorialCoherence = [0.3, 0.6];

// Practice trial properties
const practiceCoherence = [0.3, 0.6];

// Require the ID input
if (_.isEqual(Manipulations.requireID, true)) {
  timeline.push({
    type: SurveyHtmlFormPlugin,
    preamble: `<p>${i18next.t("enter_identifier")}</p>`,
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
        ${__TARGET__ === "spectrometer" ? Renderer.getEmbeddedControllerButton(1) : Renderer.getEmbeddedKeyboardButton("F")}
      </div>
      <div style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
        ${__TARGET__ === "spectrometer" ? Renderer.getEmbeddedControllerButton(4) : Renderer.getEmbeddedKeyboardButton("J")}
        <p style="font-weight: bold; font-size: large;">Next \></p>
      </div>
    </div>
  </div>`;

if (
  _.isEqual(Manipulations.showInstructions, true) &&
  !_.isEqual(keyLayout.name, "spectrometer")
) {
  // Display video
  timeline.push({
    type: InstructionsPlugin,
    pages: [
      `<h1>RDK Task</h1>
      <h2>Instructions - Video</h2>
      <iframe src="https://wustl.box.com/embed/v/rdk-instructions-video" class="video-container" frameborder="0" allowfullscreen webkitallowfullscreen msallowfullscreen></iframe>
      <p><i>This video is best viewed in fullscreen mode.</i></p>` +
        instructionContinueText,
    ],
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
    key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
    show_page_number: true,
    show_clickable_nav: keyLayout.showButtons,
  });
}

// -------------------- Tutorial games --------------------
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
  allow_keys: !keyLayout.showButtons,
  key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
  key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
  show_page_number: true,
  show_clickable_nav: keyLayout.showButtons,
});

for (let t = 0; t < Manipulations.numTutorialTrials; t++) {
  const trialName = "tutorial";
  const d = parseFloat(
    (
      (Math.random() * (tutorialDuration[1] - tutorialDuration[0]) +
        tutorialDuration[0]) *
      1000
    ).toFixed(2)
  );
  const k = Math.random() > 0.5 ? tutorialCoherence[0] : tutorialCoherence[1];
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));

  const trial = {
    type: DotGamePlugin,
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: d,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: false,
    checkConfidence: false,
    keyLayout: keyLayout,
    data: {
      name: trialName,
      number: t,
      coherence: k,
      stimulusDuration: d,
      dotDirection: r,
      referenceSelection: "",
      deviation: "left",
      correct: false,
      confidenceSelection: 0,
    },
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// -------------------- Practice games --------------------
const practice = [
  `<h1>RDK Task</h1>` +
    `<h2>Practice Games</h2>` +
    `<p>You will now play another ${Manipulations.numPracticeTrials} ` +
    `practice games. ` +
    `You won't have to rate your confidence after each game, ` +
    `but you will be shown if your answer was correct or not.</p>` +
    `<p>If your answer was correct, the cross in the ` +
    `middle of the screen will briefly turn green.</p>` +
    `<p>If your answer was wrong, the cross in the ` +
    `middle of the screen will briefly turn red.</p>` +
    instructionContinueText,
];

timeline.push({
  type: InstructionsPlugin,
  pages: practice,
  allow_keys: !keyLayout.showButtons,
  key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
  key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
  show_page_number: true,
  show_clickable_nav: keyLayout.showButtons,
});

// Attention-check question
// November 26, 2023: Removed for testing new MRI controllers

for (let t = 0; t < Manipulations.numPracticeTrials; t++) {
  const trialName = "practice";
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));
  const k = Math.random() > 0.5 ? practiceCoherence[0] : practiceCoherence[1];
  const deviation = r === 0 ? "right" : "left";

  const trial = {
    type: DotGamePlugin,
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: 1500,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: true,
    checkConfidence: false,
    keyLayout: keyLayout,
    data: {
      name: trialName,
      number: t,
      coherence: k,
      stimulusDuration: 1500,
      dotDirection: r,
      referenceSelection: "",
      deviation: deviation,
      correct: false,
      confidenceSelection: 0,
    },
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// -------------------- Calibration games --------------------
const main = [];

if (Manipulations.numCalibrationOneTrials + Manipulations.numMainTrials > 0) {
  main.push(
    `<h1>RDK Task</h1>` +
      `<p>That concludes all the practice games.</p>` +
      `<p>Take a short break now.</p>` +
      `<p>When you are ready to continue, you will play ` +
      `${
        Manipulations.numCalibrationOneTrials + Manipulations.numMainTrials
      } ` +
      `games.</p>` +
      `<p>You will not be shown if you have correctly ` +
      `answered or not, and you will be asked to rate your ` +
      `confidence after some of the games. </p>` +
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
if (_.isEqual(keyLayout.name, "spectrometer")) {
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
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.trigger.charAt(keyLayout.trigger.length - 1),
    show_clickable_nav: keyLayout.showButtons,
  });
} else {
  timeline.push({
    type: InstructionsPlugin,
    pages: main,
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
    key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
    show_page_number: true,
    show_clickable_nav: keyLayout.showButtons,
  });
}

// -------------------- Phase one calibration games --------------------
for (let t = 0; t < Manipulations.numCalibrationOneTrials; t++) {
  let trialName = "calibration";
  if (t === 0 || t === 1) trialName = "calibration-constant";

  const k = 0.2;
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));
  const deviation = r === 0 ? "right" : "left";

  const trial = {
    type: DotGamePlugin,
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: 1500,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: false,
    checkConfidence: true,
    keyLayout: keyLayout,
    data: {
      name: trialName,
      number: t,
      coherence: k,
      stimulusDuration: 1500,
      dotDirection: r,
      referenceSelection: "",
      deviation: deviation,
      correct: false,
      confidenceSelection: 0,
    },
    extensions: [{ type: NeurocogExtension }],
  };

  timeline.push(trial);
}

// Attention-check question
// November 26, 2023: Removed for testing new MRI controllers

// -------------------- Main games --------------------
for (let t = 0; t < Manipulations.numMainTrials; t++) {
  const trialName = "main";
  const k = 0.2;
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));
  const deviation = r === 0 ? "right" : "left";

  const trial = {
    type: DotGamePlugin,
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: 1500,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: false,
    checkConfidence:true,
    keyLayout: keyLayout,
    data: {
      name: trialName,
      number: t,
      coherence: k,
      stimulusDuration: 1500,
      dotDirection: r,
      referenceSelection: "",
      deviation: deviation,
      correct: false,
      confidenceSelection: 0,
    },
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
  key_forward: keyLayout.right,
});

jsPsych.run(timeline);
