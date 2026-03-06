/**
 * @summary jsPsych plugin file for Bang et al. RDK task.
 *
 * @link   https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/blob/main/src/plugin.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// Stylesheets
import "jspsych/css/jspsych.css";
import "./css/styles.css";

// External libraries
import Two from "two.js";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import consola from "consola";

// Core modules
import { Graphics } from "./classes/Graphics";
import { Stimulus } from "./classes/Stimulus";
import { Runner } from "./classes/Runner";

// Custom types
import { GraphicsParameters, IData, IStimulus, SelectionOptions } from "../types";

// Additional functions
import { getSelectionFromInput, scaling } from "./functions";

// Fixed input variables
const INPUT_POLL_INTERVAL = 10; // 10 ms
const INPUT_HOLD_DURATION = 1000; // 1000 ms

const info = {
  name: "rdk-task",
  parameters: {
    trialType: {
      type: ParameterType.STRING,
      default: undefined,
      pretty_name: "Type of trial",
    },
    trialNumber: {
      type: ParameterType.INT,
      default: undefined,
      pretty_name: "Trial number within the experiment block",
    },
    viewDistance: {
      type: ParameterType.FLOAT,
      default: undefined,
      pretty_name: "Typical viewing distance of participant (cm)",
    },
    dotAngle: {
      type: ParameterType.FLOAT,
      default: undefined,
      pretty_name: "Angle of coherent dot movement (radians)",
    },
    dotVelocity: {
      type: ParameterType.FLOAT,
      default: undefined,
      pretty_name: "Rate of dot motion",
    },
    dotDirection: {
      type: ParameterType.STRING,
      default: undefined,
      pretty_name: 'Direction of coherent dot movement, either "left" or "right"',
    },
    activeCoherence: {
      type: ParameterType.FLOAT,
      default: undefined,
      pretty_name: "Proportion of coherent dots shown to participant during dot motion",
    },
    coherences: {
      type: ParameterType.COMPLEX,
      default: undefined,
      readonly: false,
      pretty_name: "Pair of coherence values (low and high) used in main trials",
    },
    motionDuration: {
      type: ParameterType.INT,
      default: undefined,
      pretty_name: "Duration of motion presented to participants (ms)",
    },
    showFeedback: {
      type: ParameterType.BOOL,
      default: false,
      pretty_name: "Show feedback post-decision using fixation cross color",
    },
    buttonMap: {
      type: ParameterType.COMPLEX,
      default: undefined,
      pretty_name: "Mapping of keyboard or other inputs to decision responses",
    },
  },
};

type Info = typeof info;

class DotGamePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Create data frame and merge in trial parameters
    let data: IData = {
      trialType: trial.trialType,
      trialNumber: 0,
      score: 0,
      // Timing data
      trialStart: 0,
      trialEnd: 0,
      trialDuration: 0,
      decisionStart: 0,
      decisionEnd: 0,
      decisionDuration: 0,
      motionDuration: trial.motionDuration,
      // Selection data
      selection: "vc_l",
      correct: 0,
      // Coherence data
      activeCoherence: trial.activeCoherence,
      coherences: trial.coherences,
    };

    // Setup variables
    const distanceFromScreen = trial.viewDistance;
    let selection = "";
    let keypressTimer: NodeJS.Timer;

    // Setup distance-related variables
    let viewRadius = Math.ceil(Math.abs(distanceFromScreen * Math.tan(8)));
    let dotRadius = Math.ceil(Math.abs(distanceFromScreen * Math.tan(0.12)));
    let width = viewRadius * 2 + 10;
    let height = viewRadius * 2 + 10;

    // Apply scaling
    if (height > window.innerHeight) {
      height *= scaling();
      width *= scaling();
      viewRadius *= scaling();
      dotRadius *= scaling();
    }

    // Instantiate new <div> container for graphics elements
    const containerDiv = document.createElement("div");
    containerDiv.className = "graphics-container";
    display_element.appendChild(containerDiv);
    const childDiv = document.createElement("div");
    containerDiv.appendChild(childDiv);

    // Setup the Graphics and Two.js parameters
    const two = new Two({
      type: Two.Types.webgl,
      width: width,
      height: height,
    }).appendTo(childDiv);

    const graphicsParameters: GraphicsParameters = {
      two: two,
      displayElement: childDiv,
      distanceFromScreen: distanceFromScreen,
      apertureRadius: viewRadius,
      dotRadius: dotRadius,
      viewWidth: width,
      viewHeight: height,
    };
    let graphics = new Graphics(this.jsPsych, trial, graphicsParameters);

    // Determine the trial number
    data.trialNumber = 0;
    const trialDataCollection = this.jsPsych.data.get().values();
    trialDataCollection.forEach((trial) => {
      if (trial.trial_type === "rdk-task") {
        data.trialNumber = trial.trialNumber + 1;
      }
    });

    // NOTE: Compute the score for "main" trials only
    if (trial.trialType === "main") {
      data.score = 0;
      trialDataCollection.forEach((storedTrial) => {
        if (storedTrial.trial_type === "rdk-task" && storedTrial.trialName === "main") {
          data.score = storedTrial.score;
        }
      });
    }

    /**
     * Iterates through each of the stimuli by popping a stimulus from the
     * front of the stimuli list. Activates that stimulus using the Runner
     * class. Calls `endTrial()` if all stimuli have been displayed for the
     * trial.
     */
    const nextStimulus = () => {
      if (stimuli.length === 0) {
        // End the trial if there are no more stimuli to display
        data.trialEnd = performance.now();
        data.trialDuration = data.trialEnd - data.trialStart;
        endTrial();
      } else {
        currentStimulus = stimuli.shift();

        // Configure stimulus-specific parameters
        if (currentStimulus.getParameters().stimulusName === "decision") {
          // Decision stimulus
          data.decisionStart = performance.now();
          graphics.cursorVisibility(false);
        } else if (currentStimulus.getParameters().stimulusName === "motion") {
          data.motionDuration = currentStimulus.getParameters().stimulusTiming.run;
          graphics.cursorVisibility(false);
        } else if (currentStimulus.getParameters().stimulusName === "initial") {
          graphics.cursorVisibility(false);
        } else if (currentStimulus.getParameters().stimulusName === "feedback") {
          // Append colored fixation cross for `feedback` stimuli
          const feedbackStimulusComponent = data.correct === 0 ? "feedback_incorrect" : "feedback_correct";
          currentStimulus.getParameters().stimulusComponents.push(feedbackStimulusComponent);
          graphics.cursorVisibility(false);
        } else {
          graphics.cursorVisibility(true);
        }

        // Start the stimulus
        Runner.start(currentStimulus);
      }
    };

    // NOTE: Variable used to store active keypresses alongside the timestamp
    // at which they were first held down
    const inputState: { [key: string]: number } = {};

    /**
     * Utility function to evaluate if a valid key has been held for
     * a required duration, keys specified as part of the `buttonMap` trial
     * parameter
     * @param {string} keycode Lowercase `keycode` of an input
     */
    const hasSelected: (keycode: string) => boolean = (keycode: string) => {
      if (keycode in inputState && Object.values(trial.buttonMap).includes(keycode)) {
        return performance.now() - inputState[keycode] >= 1000;
      }
      return false;
    };

    /**
     * An event handler for keydown during decision input
     */
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const keycode = event.key.toLowerCase();

      // Block unknown inputs
      if (!Object.values(trial.buttonMap).includes(keycode)) {
        return;
      }

      // Edge case: Holding a button prior to input being accepted
      if (!(keycode in inputState) && Object.keys(inputState).length === 0 && event.repeat) {
        // Block holding keys across trials
        return;
      }

      // Check if key has been pressed, add if the only key being pressed
      if (!(keycode in inputState) && Object.keys(inputState).length === 0) {
        inputState[keycode] = performance.now();
        setupKeyInterval(keycode);
      } else if (Object.keys(inputState).length > 1) {
        // Block holding multiple keys simultaneously
        return;
      }
    };

    /**
     * An event handler for keyup during decision input
     */
    const onKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      const keycode = event.key.toLowerCase(); // Convert to lowercase for consistent comparison

      if (keycode in inputState) {
        // Remove key from input state
        delete inputState[keycode];

        // Reset visual progress
        graphics.setButtonProgress(getSelectionFromInput(keycode, trial.buttonMap), 0);
      }
    };

    /**
     * Create the polling interval using `setInterval` to monitor specific keypresses, updating
     * button progress, and calling `handleSelection` if held for required duration
     * @param {string} keycode Keycode associated with the valid input key being pressed
     */
    const setupKeyInterval = (keycode: string) => {
      keypressTimer = setInterval(
        (graphics: Graphics) => {
          if (hasSelected(keycode)) {
            handleSelection(keycode);
          } else {
            const progressPercentage = ((performance.now() - inputState[keycode]) / INPUT_HOLD_DURATION) * 100;
            graphics.setButtonProgress(getSelectionFromInput(keycode, trial.buttonMap), progressPercentage);
          }
        },
        INPUT_POLL_INTERVAL,
        graphics
      ); // Note: Pass `Graphics` instance so function has access
    };

    /**
     * An event handler for decision made during a trial
     * @param {string} keycode the particular event or keypress
     */
    const handleSelection = (keycode: string) => {
      // Teardown input timer
      clearInterval(keypressTimer);

      // Clear all other input handlers
      currentStimulus.clearEventListeners();

      if (currentStimulus.getParameters().stimulusName === "decision") {
        // Map keycode to selection string to store in data
        selection = getSelectionFromInput(keycode, trial.buttonMap);
        consola.info("Selected:", selection);

        // Calculate and store selection data
        data.decisionEnd = performance.now();
        data.decisionDuration = data.decisionEnd - data.decisionStart;
        data.selection = selection as SelectionOptions;

        // Normalize correct data
        // NOTE: Format of selection is `<confidence>_<direction>`, split by `_`
        // then compare to first letter of `dotDirection` (`left` or `right`)
        data.correct = selection.split("_")[1] === trial.dotDirection[0] ? 1 : 0;

        // Increment score if correct
        if (data.correct === 1 && trial.trialType === "main") {
          data.score++;
        }

        // Continue to the next Stimulus
        Runner.post(currentStimulus);
      }
    };

    /**
     * Adjusts coherence level based on calibration data
     */
    const adjustCalibrationCoherence = (priorTrialPair: IData[]) => {
      // Determine how many trials have elapsed
      if (priorTrialPair[0] !== undefined) {
        // One trial must have elapsed, retrieve the most recent coherence
        data.activeCoherence = priorTrialPair[1].activeCoherence;

        // Check previous two calibration trials
        if (priorTrialPair[0].correct === 1 && priorTrialPair[1].correct === 1) {
          // If both of the two previous trials are correct, check if the
          // coherence value was adjusted
          if (priorTrialPair[0].activeCoherence === priorTrialPair[1].activeCoherence) {
            // If the coherence value hasn't been adjusted, decrease it.
            data.activeCoherence = parseFloat((priorTrialPair[1].activeCoherence - 0.01).toFixed(3));
          }
        } else if (priorTrialPair[1].correct === 0) {
          // Else increase coherence value if the previous trial was
          // incorrect
          data.activeCoherence = parseFloat((priorTrialPair[1].activeCoherence + 0.01).toFixed(3));
        }
      }
    };

    /**
     * End the trial
     */
    const endTrial = () => {
      consola.success("Completed Trial:", `"${trial.trialType}",`, `Trial index: ${data.trialNumber}`);

      // Clean up renderer and graphics
      graphics.clear();
      graphics = null;
      Two.Instances.pop();
      display_element.innerHTML = "";

      // Finalise the trial
      this.jsPsych.finishTrial(data);
    };

    const priorTrialPair: IData[] = this.jsPsych.data.get().last(2).values();
    if (trial.trialType === "calibration") {
      // NOTE: Only apply adjustments to coherence values if at least 2 calibration trials have elapsed
      if (priorTrialPair[0].trialType === "calibration" && priorTrialPair[1].trialType === "calibration") {
        adjustCalibrationCoherence(priorTrialPair);
      }
    } else if (trial.trialType === "main") {
      // Check if this is the first main trial
      const previousTrial = priorTrialPair[0];

      // Calculate the median coherence to use in the coming trials
      if (previousTrial.trialType !== "main" && data.trialNumber === 0) {
        // If this is the first, compute the median of the last 20 trials
        let kMedian = this.jsPsych.data.get().last(21).select("activeCoherence").median();

        // Adjust coherence to constrain it within [0.12, 0.50]
        if (kMedian > 0.5) {
          kMedian = 0.5;
        } else if (kMedian < 0.12) {
          kMedian = 0.12;
        }

        // Generate the list of coherences
        data.coherences = [kMedian * 0.5, kMedian * 2.0];
      } else {
        // Else re-use the coherence from previous main calibration trials
        data.coherences = priorTrialPair[1].coherences;
      }

      // Pick either high or low coherence
      data.activeCoherence = data.coherences[Math.floor(Math.random() * data.coherences.length)];
    }

    // Setup the properties of each stimulus used in the trial
    // Initial display of the fixation cross
    const initial: IStimulus = {
      stimulusName: "initial",
      stimulusComponents: ["outline", "fixation"],
      isInteractive: false,
      stimulusTiming: {
        pre: 0,
        run: 1000,
        post: 0,
      },
      two: two,
      graphics: graphics,
      onKeyUp: () => {},
      onKeyDown: () => {},
      onStimulusEnd: nextStimulus,
    };

    // Display of the dots in motion
    const motion: IStimulus = {
      stimulusName: "motion",
      stimulusComponents: ["outline", "fixation", "dots"],
      isInteractive: false,
      stimulusTiming: {
        pre: 0,
        run: trial.motionDuration,
        post: 0,
      },
      two: two,
      graphics: graphics,
      onKeyUp: () => {},
      onKeyDown: () => {},
      onStimulusEnd: nextStimulus,
    };

    // Display of the reference angle and the coloured arcs for
    // user selection
    const decision: IStimulus = {
      stimulusName: "decision",
      stimulusComponents: ["outline", "fixation", "left", "right", "left_arc", "right_arc"],
      isInteractive: true,
      stimulusTiming: {
        pre: 0,
        run: -1,
        post: 0,
      },
      two: two,
      graphics: graphics,
      onKeyUp: onKeyUp,
      onKeyDown: onKeyDown,
      onStimulusEnd: nextStimulus,
    };

    // Feedback cross displayed when `showFeedback` is true
    const feedback: IStimulus = {
      stimulusName: "feedback",
      stimulusComponents: ["outline"],
      isInteractive: false,
      stimulusTiming: {
        pre: 0,
        run: 1000,
        post: 0,
      },
      two: two,
      graphics: graphics,
      onStimulusEnd: nextStimulus,
    };

    // Brief display of the fixation cross.
    const post: IStimulus = {
      stimulusName: "post-decision",
      stimulusComponents: ["outline", "fixation"],
      isInteractive: false,
      stimulusTiming: {
        pre: 0,
        run: 250,
        post: 0,
      },
      two: two,
      graphics: graphics,
      onStimulusEnd: nextStimulus,
    };

    // Construct a list of the stimuli, optionally adding `feedback` if required
    const stimuli: Stimulus[] = [
      new Stimulus(initial),
      new Stimulus(motion),
      new Stimulus(decision),
      ...(trial.showFeedback ? [new Stimulus(feedback)] : []),
      new Stimulus(post),
    ];

    let currentStimulus: Stimulus = null;
    data.trialStart = performance.now();

    consola.start("Running Trial:", `"${trial.trialType}",`, `Trial index: ${data.trialNumber}`);
    if (trial.trialType === "main") {
      consola.info("Coherences:", data.coherences);
    }
    consola.info("Active Coherence:", data.activeCoherence);
    nextStimulus();
  }
}

export default DotGamePlugin;
