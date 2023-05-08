/**
 * @summary Timeline configuration of Bang et al. RDK task.
 *
 * @Description Constructs the timeline of the task using a variety of
 * plugins.
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/index.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */
import { Experiment } from "neurocog";

// Utility libraries
import _ from "lodash";

// Import jsPsych to ensure it is bundled when compiled
import "jspsych/jspsych";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-preload";
import "jspsych/plugins/jspsych-survey-html-form";
import "jspsych-attention-check";

// Import the plugin before adding it to the timeline
import "./plugin";

// Configuration
import { configuration } from "./configuration";

// Additional functions
import { calculateDuration, scaling } from "./functions";

export const experiment = new Experiment(configuration);

const timeline = [];

const duration = calculateDuration();
const keyLayout = configuration.layouts[configuration.keys];

// Tutorial trial properties
const tutorialDuration = [1, 5];
const tutorialCoherence = [0.3, 0.6];

// Practice trial properties
const practiceCoherence = [0.3, 0.6];

// Standard experiment flow
if (_.isEqual(configuration.manipulations.requireID, true)) {
  timeline.push({
    type: "survey-html-form",
    preamble: `<p>Enter a participant identifier</p>`,
    html: `<input name="participantIdentifier" type="text" required /></br></br>`,
  });
}

if (_.isEqual(configuration.manipulations.demoMode, false)) {
  // Set the experiment to run in fullscreen mode
  timeline.push({
    type: "fullscreen",
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
          src="${experiment
            .getStimuli()
            .getImage("ControlsNavigationSpectrometer.png")}"
          style="${configuration.style.controls}"
        >
      </div>`;
  } else {
    instructionContinueText = `<div id="instructions-navigation">
        <br>
        <hr>
        <img
          src="${experiment
            .getStimuli()
            .getImage("ControlsNavigationDesktop.png")}"
          style="${configuration.style.controls}"
        >
      </div>`;
  }

  // Configure the correct image key to be shown
  let leftControlImage: string;
  let rightControlImage: string;
  let submitControlImage: string;
  if (_.isEqual(keyLayout.name, "spectrometer")) {
    leftControlImage = `<img
        src="${experiment.getStimuli().getImage("2.png")}"
        style="${configuration.style.keyboard}"
      > `;
    rightControlImage = `<img
        src="${experiment.getStimuli().getImage("3.png")}"
        style="${configuration.style.keyboard}"
      > `;
    submitControlImage = `<img
        src="${experiment.getStimuli().getImage("4.png")}"
        style="${configuration.style.keyboard}"
      > `;
  } else {
    leftControlImage = `<img
        src="${experiment.getStimuli().getImage("F.png")}"
        style="${configuration.style.keyboard}"
      > `;
    rightControlImage = `<img
        src="${experiment.getStimuli().getImage("J.png")}"
        style="${configuration.style.keyboard}"
      > `;
    submitControlImage = `<img
        src="${experiment.getStimuli().getImage("K.png")}"
        style="${configuration.style.keyboard}"
      > `;
  }

  const description = [
    `<h1>${configuration.name} game</h1>
      <p><b>Approximate duration:</b> ${duration} minutes</p>
      <h2>Instructions</h2>
      <p>In each game, you will be briefly shown dots moving inside a circular area.</p>
      <p>An example illustrating the appearance of these dots is shown below:</p>
      <img
        src="${experiment.getStimuli().getImage("InstructionsMovingDots.gif")}"
        style="${configuration.style.image}"
      >
      <p>When watching the dots, focus on the cross (<b>+</b>) at the center of the circular area. It will make it easier to notice the motion of the dots.</p>
      ${instructionContinueText}`,

    `<h1>${configuration.name} game</h1>
      <h2>Instructions</h2>
      <p>After watching the dots, a blue section and an orange section will appear on the perimeter of the circle.</p>
      <p>It will look like the image below:</p>
      <img
        src="${experiment.getStimuli().getImage("InstructionsReference.png")}"
        style="${configuration.style.image}"
      />
      <p><b>Your task:</b> Determine whether there was movement of dots towards the blue or the orange section.</p>
      <p>Press ${leftControlImage} on your keyboard to select <span style="color: #3ea3a3;">blue</span>, or press ${rightControlImage} on your keyboard to select <span style="color: #d78000;">orange</span>.</p>
      ${instructionContinueText}`,

    `<h1>${configuration.name} game</h1>` +
      `<h2>Instructions</h2>` +
      `<p>After deciding the direction the dots were moving, ` +
      `you will rate how confident you were in making your decision.</p>` +
      `<p>You will see a slider like the one below:</p>` +
      `<img src="${experiment
        .getStimuli()
        .getImage("InstructionsConfidence.png")}" ` +
      `style="${configuration.style.image}"/>` +
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

  if (_.isEqual(configuration.showInstructions, true)) {
    timeline.push({
      type: "instructions",
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
      type: "instructions",
      pages: [
        `<h1>${configuration.name} Game</h1>` +
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

  // Attention-check question
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: "attention-check",
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
    });
  }

  // -------------------- Tutorial games --------------------
  // Spectrometer start
  const tutorialGames = [
    `<h1>${configuration.name} game</h1>` +
      `<h2>Practice Games</h2>` +
      `<p>Play a few games now and practice watching the dots while ` +
      `observing the appearance of the game.</p>` +
      (_.isEqual(keyLayout.name, "spectrometer") ?
      `<p>Use the buttons associated with the prompts to interact with the game.</p>`
      : `<p>Your mouse will be hidden only when the circular view is visible.</p>`)
       +
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

  for (let t = 0; t < configuration.manipulations.numTutorialTrials; t++) {
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
    `<h1>${configuration.name} game</h1>` +
      `<h2>Practice Games</h2>` +
      `<p>You will now play another ${configuration.manipulations.numPracticeTrials} ` +
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
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: "attention-check",
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
    });
  }

  for (let t = 0; t < configuration.manipulations.numPracticeTrials; t++) {
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

  // -------------------- Calibration games --------------------
  const main = [
    `<h1>${configuration.name} game</h1>` +
      `<p>That concludes all the practice games.</p>` +
      `<p>Take a short break now.</p>` +
      `<p>When you are ready to continue, you will play ` +
      `${
        configuration.manipulations.numCalibrationOneTrials +
        configuration.manipulations.numMainTrials
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
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: "attention-check",
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
    });
  }

  // -------------------- Spectrometer --------------------
  // If inside the spectrometer, wait until the signal key is pressed.
  // Else, use the standard pre-game screen.
  if (_.isEqual(keyLayout.name, "spectrometer")) {
    const spectrometer = [
      `<h1>${configuration.name} game</h1>` +
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
  for (
    let t = 0;
    t < configuration.manipulations.numCalibrationOneTrials;
    t++
  ) {
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
  if (!_.isEqual(keyLayout.name, "spectrometer")) {
    timeline.push({
      type: "attention-check",
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
    });
  }

  // -------------------- Main games --------------------
  for (let t = 0; t < configuration.manipulations.numMainTrials; t++) {
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

  // Add end screen to the experiment
  const end =
    `<h1>${configuration.name} game</h1>` +
    `<h2>Experiment finished</h2>` +
    `<p>Thank you for your participation in this research.</p>` +
    `<p>Press ${submitControlImage} to end the experiment.</p>`;

  timeline.push({
    type: "instructions",
    pages: [end],
    allow_backward: false,
    button_label_next: "Finish",
    show_clickable_nav: false,
    key_forward: keyLayout.submit,
  });
} else {
  // Enable demo mode, looping trials that show feedback and ask for confidence estimates
  for (let t = 0; t < 100; t++) {
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
      checkConfidence: true,
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
}

experiment.start({
  timeline: timeline,
  show_progress_bar: _.isEqual(keyLayout.name, "desktop"),
});
