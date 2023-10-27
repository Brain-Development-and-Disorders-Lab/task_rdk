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
import jsPsychAttentionCheck from "jspsych-attention-check";

// Neurocog extension
import NeurocogExtension from "neurocog";

// Import the plugin before adding it to the timeline
import DotGamePlugin from "./plugin";

// Additional functions and variables
import { scaling } from "./functions";

// Load translations
import * as en_us from "../locales/en-us.json";
i18next.init({
  lng: "en",
  debug: true,
  resources: {
    en: en_us
  },
});

/**
 * Initialize jsPsych
 */
const jsPsych = initJsPsych({
  extensions: [
    {
      type: NeurocogExtension,
      params: {
        name: "RDK Task",
        studyName: "task_rdk",
        allowParticipantContact: false,
        contact: "henry.burgess@wustl.edu",
        seed: 0.3723,
      }
    }
  ],
});

// Input configurations, mapping device inputs to task actions
const InputConfigurations = {
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
    trigger: "t",
    showButtons: false,
  },
};

// Experimental parameters, defining the number of trials and other experiment behavior
export const Manipulations = {
  numTutorialTrials: jsPsych.extensions.Neurocog.getManipulation("numTutorialTrials", 10),
  numPracticeTrials: jsPsych.extensions.Neurocog.getManipulation("numPracticeTrials", 10),
  numCalibrationOneTrials: jsPsych.extensions.Neurocog.getManipulation("numCalibrationOneTrials", 120),
  numMainTrials: jsPsych.extensions.Neurocog.getManipulation("numMainTrials", 200),
  nGap: jsPsych.extensions.Neurocog.getManipulation("nGap", 2),
  requireID: jsPsych.extensions.Neurocog.getManipulation("requireID", false),
  demoMode: jsPsych.extensions.Neurocog.getManipulation("demoMode", false),
  showInstructions: jsPsych.extensions.Neurocog.getManipulation("showInstructions", false),
};

console.info("Manipulations:", Manipulations);

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

// Generate regular or demo timelines
if (_.isEqual(Manipulations.demoMode, false)) {
  // Require the ID input
  if (_.isEqual(Manipulations.requireID, true)) {
    timeline.push({
      type: SurveyHtmlFormPlugin,
      preamble: `<p>${i18next.t("enter_identifier")}</p>`,
      html: `<input name="participantIdentifier" type="text" required /></br></br>`,
    });
  }

  // Set the experiment to run in fullscreen mode
  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: true,
    message: `<p>Enable fullscreen view</p>`,
    delay_after: 1500,
  });

  // -------------------- Instructions --------------------
  let instructionContinueText: string;
  if (_.isEqual(keyLayout.name, "spectrometer")) {
    instructionContinueText = `<div id="instructions-navigation">
        <br>
        <hr>
        <img
          src="${jsPsych.extensions.Neurocog
            .getStimulus("ControlsNavigationSpectrometer.png")}"
          class="controls-graphic"
        >
      </div>`;
  } else {
    instructionContinueText = `<div id="instructions-navigation">
        <br>
        <hr>
        <img
          src="${jsPsych.extensions.Neurocog.getStimulus("ControlsNavigationDesktop.png")}"
          class="controls-graphic"
        >
      </div>`;
  }

  // Configure the correct image key to be shown
  let leftControlImage: string;
  let rightControlImage: string;
  let submitControlImage: string;
  if (_.isEqual(keyLayout.name, "spectrometer")) {
    leftControlImage = `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("2.png")}"
        class="keyboard-graphic"
      > `;
    rightControlImage = `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("3.png")}"
        class="keyboard-graphic"
        > `;
    submitControlImage = `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("4.png")}"
        class="keyboard-graphic"
      > `;
  } else {
    leftControlImage = `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("F.png")}"
        class="keyboard-graphic"
      > `;
    rightControlImage = `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("J.png")}"
        class="keyboard-graphic"
      > `;
    submitControlImage = `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("K.png")}"
        class="keyboard-graphic"
      > `;
  }

  const description = [
    `<h1>RDK Task</h1>` +
      `<p><b>Approximate duration:</b> 45 minutes</p>` +
      `<h2>Instructions</h2>` +
      `<p>In each game, you will be briefly shown dots moving inside a circular area.</p>` +
      `<p>An example illustrating the appearance of these dots is shown below:</p>` +
      `<img
        src="${jsPsych.extensions.Neurocog.getStimulus("InstructionsMovingDots.gif")}"
        class="image-graphic"
      >` +
      `<p>When watching the dots, focus on the cross (<b>+</b>) at the center of the circular area. It will make it easier to notice the motion of the dots.</p>` +
      `${instructionContinueText}`,

    `<h1>RDK Task</h1>
    <h2>Instructions</h2>
    <p>After watching the dots, a blue section and an orange section will appear on the perimeter of the circle.</p>
    <p>It will look like the image below:</p>
    <img
      src="${jsPsych.extensions.Neurocog.getStimulus("InstructionsReference.png")}"
      class="image-graphic"
    />
    <p><b>Your task:</b> Determine whether there was movement of dots towards the blue or the orange section.</p>
    <p>Press ${leftControlImage} on your keyboard to select <span style="color: #3ea3a3;">blue</span>, or press ${rightControlImage} on your keyboard to select <span style="color: #d78000;">orange</span>.</p>
    ${instructionContinueText}`,

    `<h1>RDK Task</h1>` +
    `<h2>Instructions</h2>` +
    `<p>After deciding the direction the dots were moving, ` +
    `you will rate how confident you were in making your decision.</p>` +
    `<p>You will see a slider like the one below:</p>` +
    `<img src="${jsPsych.extensions.Neurocog.getStimulus("InstructionsConfidence.png")}" ` +
    `class="image-graphic"/>` +
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

  if (_.isEqual(Manipulations.showInstructions, true)) {
    timeline.push({
      type: InstructionsPlugin,
      pages: description,
      allow_keys: !keyLayout.showButtons,
      key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
      key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
      show_page_number: true,
      show_clickable_nav: keyLayout.showButtons,
    });
  } else if (!_.isEqual(keyLayout.name, "spectrometer")) {
    // Display video
    timeline.push({
      type: InstructionsPlugin,
      pages: [
        `<h1>RDK Task</h1>
        <h2>Instructions - Video</h2>
        <iframe src="https://wustl.box.com/embed/s/chdrca09riebeka65hzhpljrqv7gzj9p?sortColumn=date" class="video-container" frameborder="0" allowfullscreen webkitallowfullscreen msallowfullscreen></iframe>
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

  // Attention-check question
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: jsPsychAttentionCheck,
      prompt: "What is the purpose of this task?",
      responses: [
        {
          value: "(1) Try and decide whether I like orange or blue more",
          key: keyLayout.alt,
          correct: false,
        },
        {
          value: "(2) Guess the direction of the moving dots",
          key: keyLayout.left,
          correct: true,
        },
        {
          value:
            "(3) Try and stop other participants from guessing the direction of the dots",
          key: keyLayout.right,
          correct: false,
        },
      ],
      style: "radio",
      continue: {
        confirm: true,
        key: keyLayout.submit,
      },
      input_timeout: 1500,
      feedback: {
        correct:
          "Correct! You will have to guess the direction of the moving dots.",
        incorrect:
          "Incorrect. You will have to guess the direction of the moving dots.",
      },
      extensions: [{ type: NeurocogExtension }],
    });
  }

  // -------------------- Tutorial games --------------------
  // Spectrometer start
  const tutorialGames = [
    `<h1>RDK Task</h1>` +
      `<h2>Practice Games</h2>` +
      `<p>Play a few games now and practice watching the dots while ` +
      `observing the appearance of the game.</p>` +
      (_.isEqual(keyLayout.name, "spectrometer")
        ? `<p>Use the buttons associated with the prompts to interact with the game.</p>`
        : `<p>Your mouse will be hidden only when the circular view is visible.</p>`) +
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
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: jsPsychAttentionCheck,
      prompt:
        "How will you know if you have correctly guessed the " +
        "direction of the dots in the next practice games?",
      responses: [
        {
          value: "(1) I will never be told the answer",
          key: keyLayout.alt,
          correct: false,
        },
        {
          value: "(2) The fixation cross in the circle will go green",
          key: keyLayout.left,
          correct: true,
        },
        {
          value: "(3) The fixation cross in the circle will go red",
          key: keyLayout.right,
          correct: false,
        },
      ],
      style: "radio",
      continue: {
        confirm: true,
        key: keyLayout.submit,
      },
      input_timeout: 1500,
      feedback: {
        correct: "Correct! The fixation cross in the circle will go green.",
        incorrect: "Incorrect. The fixation cross in the circle will go green",
      },
      extensions: [{ type: NeurocogExtension }],
    });
  }

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

  if (
    Manipulations.numCalibrationOneTrials + Manipulations.numMainTrials >
    0
  ) {
    main.push(
      `<h1>RDK Task</h1>` +
        `<p>That concludes all the practice games.</p>` +
        `<p>Take a short break now.</p>` +
        `<p>When you are ready to continue, you will play ` +
        `${
          Manipulations.numCalibrationOneTrials +
          Manipulations.numMainTrials
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
        `<p>Press ${rightControlImage} on your keyboard to answer one final question.</p>`
    );
  }

  // Attention-check question
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: jsPsychAttentionCheck,
      prompt: "What is the best way to detect the motion of the moving dots?",
      responses: [
        {
          value: "(1) Look at the corner of the screen",
          key: keyLayout.alt,
          correct: false,
        },
        {
          value: "(2) Focus on the fixation cross in the circle",
          key: keyLayout.left,
          correct: true,
        },
        {
          value: "(3) Track them with your finger",
          key: keyLayout.right,
          correct: false,
        },
      ],
      style: "radio",
      continue: {
        confirm: true,
        key: keyLayout.submit,
      },
      input_timeout: 1500,
      feedback: {
        correct:
          "Correct! You should focus on the fixation cross in the circle.",
        incorrect:
          "Incorrect. You should focus on the fixation cross in the circle",
      },
      extensions: [{ type: NeurocogExtension }],
    });
  }

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
  for (
    let t = 0;
    t < Manipulations.numCalibrationOneTrials;
    t++
  ) {
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
      checkConfidence: (t + 1) % Manipulations.nGap === 0 && t > 0,
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
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: jsPsychAttentionCheck,
      prompt: "What is the objective of this task?",
      responses: [
        {
          value: "(1) Try and decide whether I like orange or blue more",
          key: keyLayout.alt,
          correct: false,
        },
        {
          value: "(2) Guess the direction of the moving dots",
          key: keyLayout.left,
          correct: true,
        },
        {
          value:
            "(3) Try and stop other participants from guessing the direction of the dots",
          key: keyLayout.right,
          correct: false,
        },
      ],
      style: "radio",
      continue: {
        confirm: true,
        key: keyLayout.submit,
      },
      input_timeout: 1500,
      feedback: {
        correct:
          "Correct! You will have to guess the direction of the moving dots.",
        incorrect:
          "Incorrect. You will have to guess the direction of the moving dots.",
      },
      extensions: [{ type: NeurocogExtension }],
    });
  }

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
      checkConfidence: (t + 1) % Manipulations.nGap === 0 && t > 0,
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
    `<p>Thank you for your participation in this research.</p>` +
    `<p>Press ${submitControlImage} to end the task.</p>`;

  timeline.push({
    type: InstructionsPlugin,
    pages: [end],
    allow_backward: false,
    button_label_next: "Finish",
    show_clickable_nav: false,
    key_forward: keyLayout.submit,
  });
} else {
  // Number of demonstration trials
  const demoTrials = 20;

  // Include instructions for the demonstration
  const demoInstructions = [
    `<h1>RDK Task</h1>` +
      `<h2>Confidence demo</h2>` +
      `<p>The following ${demoTrials} trials demonstrate a confidence comparison task.</p>` +
      `<p>You will be asked to indicate which of two decisions was associated with greater confidence.</p>` +
      `<p>Press ` +
      `<img src="${jsPsych.extensions.Neurocog.getStimulus(
          `${keyLayout.right
            .charAt(keyLayout.right.length - 1)
            .toUpperCase()}.png`
        )}" ` +
      `class="keyboard-graphic"/>` +
      `to continue.</p>`,
  ];
  timeline.push({
    type: InstructionsPlugin,
    pages: demoInstructions,
    allow_keys: !keyLayout.showButtons,
    key_forward: keyLayout.right.charAt(keyLayout.right.length - 1),
    key_backward: keyLayout.left.charAt(keyLayout.left.length - 1),
    show_page_number: true,
    show_clickable_nav: keyLayout.showButtons,
  });

  // Generate demonstration trials
  for (let t = 0; t < demoTrials; t++) {
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
      showFeedback: false,
      checkConfidence:
        (t + 1) % Manipulations.nGap === 0 && t > 0,
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

  const end =
    `<h1>RDK Task</h1>` +
    `<h2>Confidence demo finished</h2>` +
    `<p>Press ` +
    `<img src="${jsPsych.extensions.Neurocog.getStimulus(
        `${keyLayout.right
          .charAt(keyLayout.right.length - 1)
          .toUpperCase()}.png`
      )}" ` +
    `class="keyboard-graphic"/>` +
    ` to end the task.</p>`;

  timeline.push({
    type: InstructionsPlugin,
    pages: [end],
    allow_backward: false,
    button_label_next: "Finish",
    show_clickable_nav: false,
    key_forward: keyLayout.right,
  });
}

jsPsych.run(timeline);
