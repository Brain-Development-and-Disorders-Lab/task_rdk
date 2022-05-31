/**
 * @summary Timeline configuration of Bang et al. RDK task.
 *
 * @Description Constructs the timeline of the task using a variety of
 * plugins.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/bang_2018_decision_confidence/src/timeline.js
 * @author Henry Burgess <s4481993@student.uq.edu.au>
 */
import Experiment from "neurocog";

// Import jsPsych to ensure it is bundled when compiled
import "jspsych/jspsych";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-preload";
import "jspsych-attention-check/src/jspsych-attention-check";

// Import the plugin before adding it to the timeline
import "./Plugin";

// Configuration
import { Configuration } from "./Configuration";

// Additional functions
import { scaling } from "./lib/Functions";

const experiment = new Experiment(Configuration);

const timeline = [];

const duration = calculateDuration();
const keyLayout = Configuration.layouts[Configuration.keys];

// Tutorial trial properties
const tutorialDuration = [1, 5];
const tutorialCoherence = [0.3, 0.6];

// Practice trial properties
const practiceCoherence = [0.3, 0.6];

// Set the experiment to run in fullscreen mode
timeline.push({
  type: "fullscreen",
  fullscreen_mode: true,
});

// -------------------- Instructions --------------------
let instructionContinueText: string;
if (keyLayout.name === "spectrometer") {
  instructionContinueText =
    `<div id="instructions-navigation">` +
    `<br>` +
    `<hr>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("ControlsNavigationSpectrometer.png")}" ` +
    `style="${Configuration.style.controls}">` +
    `</div>`;
} else {
  instructionContinueText =
    `<div id="instructions-navigation">` +
    `<br>` +
    `<hr>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("ControlsNavigationDesktop.png")}" ` +
    `style="${Configuration.style.controls}">` +
    `</div>`;
}

// Configure the correct image key to be shown
let leftControlImage: string;
let rightControlImage: string;
let submitControlImage: string;
if (keyLayout.name === "spectrometer") {
  leftControlImage =
    `<img src="${experiment.getStimuli().getImage("2.png")}" ` +
    `style="${Configuration.style.keyboard}"> `;
  rightControlImage =
    `<img src="${experiment.getStimuli().getImage("3.png")}" ` +
    `style="${Configuration.style.keyboard}"> `;
  submitControlImage =
    `<img src="${experiment.getStimuli().getImage("4.png")}" ` +
    `style="${Configuration.style.keyboard}"> `;
} else {
  leftControlImage =
    `<img src="${experiment.getStimuli().getImage("F.png")}" ` +
    `style="${Configuration.style.keyboard}"> `;
  rightControlImage =
    `<img src="${experiment.getStimuli().getImage("J.png")}" ` +
    `style="${Configuration.style.keyboard}"> `;
  submitControlImage =
    `<img src="${experiment.getStimuli().getImage("K.png")}" ` +
    `style="${Configuration.style.keyboard}"> `;
}

// Instructions to interact with the control questions
let controlInstructions: string;
if (keyLayout.name === "spectrometer") {
  controlInstructions =
    `<div>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("ControlsQuestionSpectrometer.png")}" ` +
    `style="${Configuration.style.controls}">` +
    `</div>`;
} else {
  controlInstructions =
    `<div>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("ControlsQuestionDesktop.png")}" ` +
    `style="${Configuration.style.controls}">` +
    `</div>`;
}

const description = [
  `<h1>${Configuration.name} game</h1>` +
    `<p><b>Approximate duration:</b> ${duration} minutes</p>` +
    `<h2>Instructions</h2>` +
    `<p>In each game, you will be briefly shown dots moving inside a ` +
    `circular area.</p>` +
    `<p>An example illustrating the appearance of these dots is ` +
    `shown below:</p>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("InstructionsMovingDots.gif")}" ` +
    `style="${Configuration.style.image}">` +
    `<p>When watching the dots, focus on the cross (<b>+</b>) at ` +
    `the center of the circular area. It will make it easier to notice ` +
    `the motion of the dots.</p>` +
    instructionContinueText,

  `<h1>${Configuration.name} game</h1>` +
    `<h2>Instructions</h2>` +
    `<p>After watching the dots, a blue section and an orange section ` +
    `will appear on the perimeter of the circle.</p>` +
    `<p>It will look like the image below:</p>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("InstructionsReference.png")}" ` +
    `style="${Configuration.style.image}"/>` +
    `<p><b>Your task:</b> Determine whether there was movement of dots ` +
    `towards the blue or the orange section.</p>` +
    `<p>Press ${leftControlImage} ` +
    `on your keyboard to select  ` +
    `<span style="color: #3ea3a3;">blue</span>, or press ` +
    `${rightControlImage} on your keyboard to select ` +
    `<span style="color: #d78000;">orange</span>.</p>` +
    instructionContinueText,

  `<h1>${Configuration.name} game</h1>` +
    `<h2>Instructions</h2>` +
    `<p>After deciding the direction the dots were moving, ` +
    `you will rate how confident you were in making your decision.</p>` +
    `<p>You will see a slider like the one below:</p>` +
    `<img src="${experiment
      .getStimuli()
      .getImage("InstructionsConfidence.png")}" ` +
    `style="${Configuration.style.image}"/>` +
    `<p>Press ${leftControlImage} ` +
    `on your keyboard to decrease your confidence, ` +
    `or press ${rightControlImage} ` +
    `on your keyboard to increase your confidence. ` +
    `</p>` +
    `<p>Once you have adjusted your confidence, press ` +
    submitControlImage +
    `to finish the game and continue. There is also a button ` +
    `to notify the researchers that you made a mistake in ` +
    `the previous trial.</p>` +
    instructionContinueText,
];
if (Configuration.showInstructions === true) {
  timeline.push({
    type: "instructions",
    pages: description,
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
    key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
    show_page_number: true,
    show_clickable_nav: keyLayout.showButtons,
  });
} else if (keyLayout.name !== "spectrometer") {
  // Display video
  timeline.push({
    type: "instructions",
    pages: [
      `<h1>${Configuration.name} Game</h1>` +
        `<h2>Instructions - Video</h2>` +
        `<div class="video-container">` +
        `<iframe style="width: 100%; height: 100%;" src="https://www.youtube.com/embed/NIJ9DBcr_qI?&autoplay=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` +
        `</div>` +
        instructionContinueText,
    ],
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
    key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
    show_page_number: true,
    show_clickable_nav: keyLayout.showButtons,
  });
}

if (keyLayout.name !== "spectrometer") {
  timeline.push({
    type: "attention-check",
    question: "What is the purpose of this task?",
    options: [
      "(1) Try and decide whether I like orange or blue more",
      "(2) Guess the direction of the moving dots",
      "(3) Try and stop other participants from guessing the direction of " +
        "the dots",
    ],
    option_correct: 1,
    option_keys: [keyLayout.alt, keyLayout.left, keyLayout.right],
    confirmation: true,
    input_timeout: 1500,
    options_radio: true,
    button_text: "Submit Answer",
    button_key: keyLayout.submit,
    feedback_correct:
      "Correct! You will have to guess the " + "direction of the moving dots.",
    feedback_incorrect:
      "Incorrect. You will have to guess the " +
      "direction of the moving dots.",
    instructions: controlInstructions,
  });
}

// -------------------- Tutorial games --------------------
// Spectrometer start
const tutorialGames = [
  `<h1>${Configuration.name} game</h1>` +
    `<h2>Practice Games</h2>` +
    `<p>Play a few games now and practice watching the dots while ` +
    `observing the appearance of the game.</p>` +
    `<p>Your mouse will be hidden only when the circular view is visible.</p>` +
    instructionContinueText,
];

timeline.push({
  type: "instructions",
  pages: tutorialGames,
  allow_keys: !keyLayout.showButtons,
  key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
  key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
  show_page_number: true,
  show_clickable_nav: keyLayout.showButtons,
});

for (let t = 0; t < Configuration.manipulations.numTutorialTrials; t++) {
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

  timeline.push({
    type: "dot-game",
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: d,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: false,
    checkConfidence: true,
    keyLayout: keyLayout,
    data: {
      name: trialName,
      coherence: k,
      stimulusDuration: d,
      dotDirection: r,
      referenceSelection: "",
      deviation: "",
      correct: false,
      confidenceSelection: 0,
    },
  });
}

// -------------------- Practice games --------------------
const practice = [
  `<h1>${Configuration.name} game</h1>` +
    `<h2>Practice Games</h2>` +
    `<p>You will now play another ${Configuration.manipulations.numPracticeTrials} ` +
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
  type: "instructions",
  pages: practice,
  allow_keys: !keyLayout.showButtons,
  key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
  key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
  show_page_number: true,
  show_clickable_nav: keyLayout.showButtons,
});

// Attention-check question
if (keyLayout.name !== "spectrometer") {
  timeline.push({
    type: "attention-check",
    question:
      "How will you know if you have correctly guessed the " +
      "direction of the dots in the next practice games?",
    options: [
      "(1) I will never be told the answer",
      "(2) The fixation cross in the circle will go green",
      "(3) The fixation cross in the circle will go red",
    ],
    option_correct: 1,
    option_keys: [keyLayout.alt, keyLayout.left, keyLayout.right],
    options_radio: true,
    confirmation: true,
    input_timeout: 1500,
    button_key: keyLayout.submit,
    button_text: "Submit Answer",
    feedback_correct:
      "Correct! The fixation cross in the circle " + "will go green.",
    feedback_incorrect:
      "Incorrect. The fixation cross in the " + "circle will go green",
    instructions: controlInstructions,
  });
}

for (let t = 0; t < Configuration.manipulations.numPracticeTrials; t++) {
  const trialName = "practice";
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));
  const k = Math.random() > 0.5 ? practiceCoherence[0] : practiceCoherence[1];
  const deviation = r === 0 ? "right" : "left";

  timeline.push({
    type: "dot-game",
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
      coherence: k,
      stimulusDuration: 1500,
      dotDirection: r,
      referenceSelection: "",
      deviation: deviation,
      correct: false,
      confidenceSelection: 0,
    },
  });
}

// -------------------- User Testing --------------------
if (Configuration.testing === true) {
  const likertScale = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ];

  timeline.push({
    type: "survey-likert-rich",
    preamble:
      `Please answer the following questions relating to the ` +
      `instructions you just read before continuing ` +
      `to the main games.`,
    questions: [
      {
        prompt: `The instructions made sense to me.`,
        name: "Question 1",
        labels: likertScale,
        required: true,
      },
      {
        prompt: `The instructions helped me play the games.`,
        name: "Question 2",
        labels: likertScale,
        required: true,
      },
      {
        prompt:
          `I did not encounter anything unexpected while playing the ` +
          `games.`,
        name: "Question 3",
        labels: likertScale,
        required: true,
      },
    ],
    feedback_placeholder: "Please enter additional feedback here.",
  });
}

// -------------------- Calibration games --------------------
const main = [
  `<h1>${Configuration.name} game</h1>` +
    `<p>That concludes all the practice games.</p>` +
    `<p>Take a short break now.</p>` +
    `<p>When you are ready to continue, you will play ` +
    `${
      Configuration.manipulations.numCalibrationOneTrials +
      Configuration.manipulations.numMainTrials
    } ` +
    `games.</p>` +
    `<p>You will not be shown if you have correctly ` +
    `answered or not, and you will be asked to rate your ` +
    `confidence after some of the games. </p>` +
    `<br>` +
    `<p>Each correct answer will give you 1 point, ` +
    `and this point will contribute to your overall ` +
    `point total across all the tasks, giving you ` +
    `a chance to enter a lottery to win a $40 bonus!</p>` +
    `<p><b>Good luck!</b></p>` +
    instructionContinueText,
];

// Attention-check question
if (keyLayout.name !== "spectrometer") {
  timeline.push({
    type: "attention-check",
    question: "What is the best way to detect the motion of the moving dots?",
    options: [
      "(1) Look at the corner of the screen",
      "(2) Focus on the fixation cross in the circle",
      "(3) Track them with your finger",
    ],
    option_keys: [keyLayout.alt, keyLayout.left, keyLayout.right],
    option_correct: 1,
    options_radio: true,
    confirmation: true,
    input_timeout: 1500,
    button_key: keyLayout.submit,
    button_text: "Submit Answer",
    feedback_correct:
      "Correct! You should focus on the fixation " + "cross in the circle.",
    feedback_incorrect:
      "Incorrect. You should focus on the " + "fixation cross in the circle",
    instructions: controlInstructions,
  });
}

// -------------------- Spectrometer --------------------
// If inside the spectrometer, wait until the signal key is pressed.
// Else, use the standard pre-game screen.
if (keyLayout.name === "spectrometer") {
  const spectrometer = [
    `<h1>${Configuration.name} game</h1>` +
      `<h2>Please Wait...</h2>` +
      `<p>You have now completed all of the practice games.</p>` +
      `<p>Waiting for spectrometer to be ready.</p>` +
      `<p>When this page changes, the games will commence.</p>` +
      `<p><b>Good luck!</b></p>`,
  ];

  timeline.push({
    type: "instructions",
    pages: spectrometer,
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.trigger.charAt(keyLayout.trigger.length - 1),
    show_clickable_nav: keyLayout.showButtons,
  });
} else {
  timeline.push({
    type: "instructions",
    pages: main,
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
    key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
    show_page_number: true,
    show_clickable_nav: keyLayout.showButtons,
  });
}

// -------------------- Phase one calibration games --------------------
for (let t = 0; t < Configuration.manipulations.numCalibrationOneTrials; t++) {
  let trialName = "calibration";
  if (t === 0 || t === 1) trialName = "calibration-constant";

  const k = 0.2;
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));
  const deviation = r === 0 ? "right" : "left";

  timeline.push({
    type: "dot-game",
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: 1500,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: false,
    checkConfidence: t % 5 === 0,
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
  });
}

// Attention-check question
if (keyLayout.name !== "spectrometer") {
  timeline.push({
    type: "attention-check",
    question: "What is the objective of this task?",
    options: [
      "(1) Try and decide whether I like orange or blue more",
      "(2) Guess the direction of the moving dots",
      "(3) Try and stop other participants from guessing the direction " +
        "of the dots",
    ],
    option_correct: 1,
    option_keys: [keyLayout.alt, keyLayout.left, keyLayout.right],
    options_radio: true,
    confirmation: true,
    input_timeout: 1500,
    button_key: keyLayout.submit,
    button_text: "Submit Answer",
    feedback_correct:
      "Correct! You will have to guess the " + "direction of the moving dots.",
    feedback_incorrect:
      "Incorrect. You will have to guess the " +
      "direction of the moving dots.",
    instructions: controlInstructions,
  });
}

// -------------------- Main games --------------------
for (let t = 0; t < Configuration.manipulations.numMainTrials; t++) {
  const trialName = "main";
  const k = 0.2;
  let r = Math.random() > 0.5 ? 0 : Math.PI;
  r = parseFloat(r.toFixed(3));
  const deviation = r === 0 ? "right" : "left";

  timeline.push({
    type: "dot-game",
    name: trialName,
    distance: 50 * scaling(),
    coherence: k,
    stimulusDuration: 1500,
    dotDirection: r,
    dotVelocity: 2.0,
    showFeedback: false,
    checkConfidence: t % 5 === 0,
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
  });
}

// -------------------- Functions --------------------
/**
 * Calculate the total duration of the games
 * @return {number} duration
 */
function calculateDuration() {
  // Total number of seconds
  let total =
    Configuration.manipulations.numTutorialTrials +
    Configuration.manipulations.numPracticeTrials +
    Configuration.manipulations.numCalibrationOneTrials +
    Configuration.manipulations.numMainTrials;
  total *= 0.75 + 1 + 2 + 0.25 + 4;

  total /= 60;
  return Math.ceil(total);
}

experiment.start({
  timeline: timeline,
});
