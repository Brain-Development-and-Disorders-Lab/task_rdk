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

// Core modules
import { Graphics } from "./classes/Graphics";
import { Renderer } from "./classes/Renderer";
import { Stimulus } from "./classes/Stimulus";
import { Runner } from "./classes/Runner";

// Custom types
import { IData, IRenderer, IStimulus, SelectionOptions } from "../types";

// Additional functions
import { scaling } from "./functions";

const info = {
  name: "rdk-task",
  parameters: {
    trialName: {
      type: ParameterType.STRING,
      default: undefined,
      pretty_name: "Name of the trial type",
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
      pretty_name: "Direction of coherent dot movement, either \"left\" or \"right\"",
    },
    activeCoherence: {
      type: ParameterType.FLOAT,
      default: undefined,
      pretty_name: "Proportion of coherent dots shown to participant during dot motion"
    },
    coherences: {
      type: ParameterType.COMPLEX,
      default: undefined,
      readonly: false,
      pretty_name: "Pair of coherence values (low and high) used in main trials"
    },
    motionDuration: {
      type: ParameterType.INT,
      default: undefined,
      pretty_name: "Duration of motion presented to participants (ms)"
    },
    showFeedback: {
      type: ParameterType.BOOL,
      default: false,
      pretty_name: "Show feedback post-decision using fixation cross color"
    },
    keyLayout: {
      type: ParameterType.COMPLEX,
      default: undefined,
      pretty_name: "Mapping of keyboard or other inputs to decision responses"
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
      trialName: trial.trialName,
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
    const keyLayout = trial.keyLayout;
    let selection = "";

    // Setup distance-related variables
    let viewRadius = Math.ceil(Math.abs(distanceFromScreen * Math.tan(8)));
    let dotRadius = Math.ceil(Math.abs(distanceFromScreen * Math.tan(0.12)));
    let width = viewRadius * 2 + 10;
    let height = viewRadius * 2 + 10;

    // Apply scaling
    if (height > window.innerHeight * 1.0) {
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

    // Setup the renderer and Two.js parameters
    const rendererParameters: IRenderer = {
      distanceFromScreen: distanceFromScreen,
      viewRadius: viewRadius,
      dotRadius: dotRadius,
      width: width,
      height: height,
      target: childDiv,
    };
    const twoParameters = {
      type: Two.Types.webgl,
      width: rendererParameters.width,
      height: rendererParameters.height,
    };

    // Instantiate Two.js with parameters and place in DOM
    const two = new Two(twoParameters).appendTo(childDiv);
    let renderer = new Renderer(this.jsPsych, two, rendererParameters);
    let graphics = new Graphics(this.jsPsych, trial, renderer);

    // Determine the trial number
    data.trialNumber = 0;
    const trialDataCollection = this.jsPsych.data.get().values();
    trialDataCollection.forEach((trial) => {
      if (trial.trial_type === "rdk-task") {
        data.trialNumber = trial.trialNumber + 1;
      }
    });

    // NOTE: Compute the score for "main" trials only
    if (trial.trialName === "main") {
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
        return;
      }

      currentStimulus = stimuli.shift();

      // Configure stimulus-specific parameters
      if (currentStimulus.getParameters().name === "decision") {
        // Decision stimulus
        data.decisionStart = performance.now();
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === "motion") {
        data.motionDuration = currentStimulus.getParameters().timing.run;
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === "initial") {
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === "post-decision") {
        // Set up keyup handler to wait for all keys to be released
        postDecisionKeyUpHandler = createPostDecisionKeyUpHandler();
        window.postDecisionKeyUpHandler = postDecisionKeyUpHandler;
        document.addEventListener("keyup", postDecisionKeyUpHandler);
      } else {
        graphics.cursorVisibility(true);
      }

      // Start the stimulus
      Runner.start(currentStimulus);
    };

    // Add variables for key hold functionality
    let keyHoldTimer: number | null = null;
    let currentKey: string | null = null;
    let postDecisionKeyUpHandler: ((event: KeyboardEvent) => void) | null = null;

    /**
     * An event handler for keydown during decision input
     */
    const decisionKeyDownHandler = (event: KeyboardEvent) => {
      const keycode = event.key.toLowerCase(); // Convert to lowercase for consistent comparison

      // Filter out invalid keycodes
      if (!Object.keys(currentStimulus.getParameters().keybindings).includes(keycode)) {
        return;
      }

      // Prevent default to avoid key repeat
      event.preventDefault();

      // If already holding a key, ignore (prevents multiple simultaneous key holds)
      if (currentKey !== null) {
        return;
      }

      currentKey = keycode;

      // Find the corresponding button element
      const buttonMapping = {
        [keyLayout["1"]]: "vc_l",
        [keyLayout["2"]]: "sc_l",
        [keyLayout["3"]]: "sc_r",
        [keyLayout["4"]]: "vc_r"
      };

      const buttonId = buttonMapping[keycode];
      if (buttonId) {
        const buttonElement = document.querySelector(`[data-button-id="${buttonId}"]`) as HTMLDivElement;
        if (buttonElement) {
          // Start the progress bar animation
          renderer.startProgress(buttonElement);
        }
      }

      keyHoldTimer = window.setTimeout(() => {
        if (currentKey === keycode) {
          // After 1 second, process the decision
          decisionHandler(event);
          resetKeyHold();
        }
      }, 1000);
    };

    /**
     * An event handler for keyup during decision input
     */
    const decisionKeyUpHandler = (event: KeyboardEvent) => {
      if (currentKey === event.key.toLowerCase()) {
        resetKeyHold();
      }
    };

    const resetKeyHold = () => {
      // Clear the timer
      if (keyHoldTimer) {
        clearTimeout(keyHoldTimer);
        keyHoldTimer = null;
      }

      // Reset progress bar if there's a current key
      if (currentKey) {
        const buttonMapping = {
          [keyLayout["1"]]: "vc_l",
          [keyLayout["2"]]: "sc_l",
          [keyLayout["3"]]: "sc_r",
          [keyLayout["4"]]: "vc_r"
        };

        const buttonId = buttonMapping[currentKey];
        if (buttonId) {
          const buttonElement = document.querySelector(`[data-button-id="${buttonId}"]`) as HTMLDivElement;
          if (buttonElement) {
            // Stop and reset the progress bar
            renderer.stopProgress(buttonElement);
          }
        }
      }

      currentKey = null;
    };

    /**
     * Handler for post-decision keyup events
     * Finishes the post-decision stimulus when all keys are released
     */
    const createPostDecisionKeyUpHandler = () => {
      const postDecisionStartTime = performance.now();

      return (event: KeyboardEvent) => {
        // Check if this is one of our decision keys
        const keycode = event.key.toLowerCase();
        const decisionKeys = [keyLayout["1"], keyLayout["2"], keyLayout["3"], keyLayout["4"]];

        if (decisionKeys.includes(keycode)) {
          // Check if any decision keys are still being held
          setTimeout(() => {
            if (currentStimulus && currentStimulus.getParameters().name === "post-decision") {
              const elapsedTime = performance.now() - postDecisionStartTime;
              // Minimum display time: 250ms base + 1000ms if feedback is enabled
              const minDisplayTime = trial.showFeedback === true ? 1250 : 250;

              if (elapsedTime < minDisplayTime) {
                // Wait for the remaining time before finishing
                setTimeout(() => {
                  if (currentStimulus && currentStimulus.getParameters().name === "post-decision") {
                    Runner.post(currentStimulus);
                  }
                }, minDisplayTime - elapsedTime);
              } else {
                // Already waited long enough, finish immediately
                Runner.post(currentStimulus);
              }
            }
          }, 50);
        }
      };
    };

    /**
     * An event handler for decision made during a trial
     * @param {KeyboardEvent} event the particular event or keypress
     */
    const decisionHandler = (event: KeyboardEvent) => {
      // Record the keycode to process the event
      const keycode = event.key.toLowerCase();

      // Filter out invalid keycodes
      if (!Object.keys(currentStimulus.getParameters().keybindings).includes(
        keycode
      )) {
        console.warn(
          `Invalid key "${keycode}" for stimulus type "${
            currentStimulus.getParameters().name
          }"`
        );
        return;
      }

      if (currentStimulus.getParameters().name === "decision") {
        // Handle 'decision' stimuli
        selection = currentStimulus.getParameters().keybindings[keycode].choice;
        currentStimulus.removeKeybindings();

        // Calculate and store selection data
        data.decisionEnd = performance.now();
        data.decisionDuration = data.decisionEnd - data.decisionStart;
        data.selection = selection as SelectionOptions;

        // Normalize correct data
        // NOTE: Format of selection is `<confidence>_<direction>`, split by `_`
        // then compare to first letter of `dotDirection` (`left` or `right`)
        data.correct = selection.split("_")[1] === trial.dotDirection[0] ? 1 : 0;

        // Increment score if correct
        if (data.correct === 1 && trial.trialName === "main") {
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
      // Clean up renderer and graphics
      graphics.clear();
      renderer = null;
      graphics = null;
      Two.Instances.pop();
      display_element.innerHTML = "";

      // Finalise the trial
      this.jsPsych.finishTrial(data);
    };

    const priorTrialPair: IData[] = this.jsPsych.data.get().last(2).values();
    if (trial.trialName === "calibration") {
      // NOTE: Only apply adjustments to coherence values if at least 2 calibration trials have elapsed
      if (priorTrialPair[0].trialName === "calibration" && priorTrialPair[1].trialName === "calibration") {
        adjustCalibrationCoherence(priorTrialPair);
      }
    } else if (trial.trialName === "main") {
      // Check if this is the first main trial
      const previousTrial = priorTrialPair[0];

      // Calculate the median coherence to use in the coming trials
      if (previousTrial.trialName !== "main" && data.trialNumber === 0) {
        // If this is the first, compute the median of the last 20 trials
        let kMedian = this.jsPsych.data
          .get()
          .last(21)
          .select("activeCoherence")
          .median();

        // Adjust coherence to constrain it within [0.12, 0.50]
        if (kMedian > 0.5) {
          kMedian = 0.5;
        } else if (kMedian < 0.12) {
          kMedian = 0.12;
        }

        // Generate the list of coherences
        data.coherences = [kMedian * 0.5, kMedian * 2.0];
      } else {
        // Else re-use the coherence from previous main calibration
        // trials
        data.coherences = priorTrialPair[1].coherences;
      }

      // Pick either high or low coherence
      data.activeCoherence = data.coherences[Math.floor(Math.random() * data.coherences.length)];
    }

    // Setup the properties of each stimulus used in the trial
    // Initial display of the fixation cross
    const initial: IStimulus = {
      name: "initial",
      components: ["outline", "fixation"],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      timing: {
        pre: 0,
        run: 1000,
        post: 0,
      },
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the dots in motion
    const motion: IStimulus = {
      name: "motion",
      components: ["outline", "fixation", "dots"],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      timing: {
        pre: 0,
        run: trial.motionDuration,
        post: 0,
      },
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the reference angle and the coloured arcs for
    // user selection
    const decision: IStimulus = {
      name: "decision",
      components: [
        "outline",
        "fixation",
        "left",
        "right",
        "left_arc",
        "right_arc",
      ],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: true,
      timing: {
        pre: 0,
        run: -1,
        post: 0,
      },
      keybindings: {
        [keyLayout["1"]]: {
          choice: "vc_l",
          handler: decisionKeyDownHandler,
        },
        [keyLayout["2"]]: {
          choice: "sc_l",
          handler: decisionKeyDownHandler,
        },
        [keyLayout["3"]]: {
          choice: "sc_r",
          handler: decisionKeyDownHandler,
        },
        [keyLayout["4"]]: {
          choice: "vc_r",
          handler: decisionKeyDownHandler,
        },
      },
      eventHandler: decisionKeyDownHandler,
      postTrialHandler: nextStimulus,
    };

    // Brief display of the fixation cross.
    const postDecision: IStimulus = {
      name: "post-decision",
      components: ["outline", "fixation"],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      timing: {
        pre: 0,
        run: -1, // Wait indefinitely until all keys are released
        post: 0,
      },
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Construct a list of the stimuli.
    const stimuli: Stimulus[] = [];
    stimuli.push(
      new Stimulus(initial),
      new Stimulus(motion),
      new Stimulus(decision),
      new Stimulus(postDecision)
    );

    let currentStimulus: Stimulus = null;
    data.trialStart = performance.now();

    // Make the keyup handler globally accessible
    window.decisionKeyUpHandler = decisionKeyUpHandler;

    nextStimulus();
  }
}

export default DotGamePlugin;
