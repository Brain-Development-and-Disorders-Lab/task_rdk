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
import { IRenderer } from "../types";

// Additional functions
import { scaling } from "./functions";

const info = {
  name: "rdk-task",
  parameters: {
    name: {
      type: ParameterType.STRING,
      default: undefined,
    },
    distance: {
      type: ParameterType.FLOAT,
      default: undefined,
    },
    activeCoherence: {
      type: ParameterType.FLOAT,
      default: undefined,
    },
    coherences: {
      type: ParameterType.COMPLEX,
      default: undefined,
      readonly: false,
    },
    motionDuration: {
      type: ParameterType.INT,
      default: undefined,
    },
    showFeedback: {
      type: ParameterType.BOOL,
      default: false,
    },
    keyLayout: {
      type: ParameterType.COMPLEX,
      default: undefined,
    },
    data: {
      type: ParameterType.COMPLEX,
      default: undefined,
    },
  },
};

type Info = typeof info;

class DotGamePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Setup variables
    const distanceFromScreen = trial.distance;

    // Setup distance-related variables
    let viewRadius = Math.ceil(Math.abs(distanceFromScreen * Math.tan(8)));
    let dotRadius = Math.ceil(Math.abs(distanceFromScreen * Math.tan(0.12)));

    // Setup Two.js.
    let width = viewRadius * 2 + 10;
    let height = viewRadius * 2 + 10;

    // Apply scaling
    if (height > window.innerHeight * 1.0) {
      height *= scaling();
      width *= scaling();
      viewRadius *= scaling();
      dotRadius *= scaling();
    }

    const keyLayout = trial.keyLayout;

    // Instantiate new <div> container for graphics elements
    const containerDiv = document.createElement("div");
    containerDiv.className = "graphics-container";
    display_element.appendChild(containerDiv);
    const childDiv = document.createElement("div");
    containerDiv.appendChild(childDiv);

    // Setup the renderer parameters.
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

    // Setup data-related variables.
    let selection = "";

    // Compute the trial number
    trial.data.trialNumber = 0;
    const previousTrialCollection = this.jsPsych.data.get().values();
    previousTrialCollection.forEach((storedTrial) => {
      if (storedTrial.trial_type === "rdk-task") {
        trial.data.trialNumber = storedTrial.trialNumber + 1;
      }
    });

    // Compute the trial score
    if (trial.name === "main") {
      trial.data.score = 0;
      previousTrialCollection.forEach((storedTrial) => {
        if (
          storedTrial.trial_type === "rdk-task" &&
          storedTrial.name === "main"
        ) {
          trial.data.score = storedTrial.score;
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
        trial.data.trialEnd = performance.now();
        trial.data.trialDuration = trial.data.trialEnd - trial.data.trialStart;

        endTrial();
        return;
      }

      // Clear display before retrieving the next stimuli to display.
      currentStimulus = stimuli.shift();

      // Configure stimulus-specific parameters
      if (currentStimulus.getParameters().name === "decision") {
        // Decision stimulus
        trial.data.decisionStart = performance.now();

        // Hide the mouse cursor
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === "motion") {
        trial.data.motionDuration = currentStimulus.getParameters().timing.run;

        // Hide the mouse cursor
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === "initial") {
        // Hide the mouse cursor
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === "post-decision") {
        // Set up keyup handler to wait for all keys to be released
        postDecisionKeyUpHandler = createPostDecisionKeyUpHandler();
        window.postDecisionKeyUpHandler = postDecisionKeyUpHandler;
        document.addEventListener("keyup", postDecisionKeyUpHandler);
      } else {
        // Show the mouse cursor
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
        trial.data.decisionEnd = performance.now();
        trial.data.decisionDuration = trial.data.decisionEnd - trial.data.decisionStart;
        trial.data.selection = selection;

        // Normalize correct data
        // NOTE: Format of selection is `<confidence>_<direction>`, split by `_`
        // then compare to first letter of `dotDirection` (`left` or `right`)
        trial.data.correct = selection.split("_")[1] === trial.data.dotDirection[0] ? 1 : 0;

        // Increment score if correct
        if (trial.data.correct === 1 && trial.name === "main") {
          trial.data.score++;
        }

        // Continue to the next Stimulus
        Runner.post(currentStimulus);
      }
    };

    /**
     * Adjusts coherence level based on calibration data
     */
    const adjustCalibrationCoherence = () => {
      // Get the previous data from trials
      const previousTrialData = this.jsPsych.data.get().last(2).values();

      // Determine how many trials have elapsed
      if (previousTrialData[0] !== undefined) {
        // One trial must have elapsed, retrieve the most recent coherence
        trial.data.activeCoherence = previousTrialData[1].activeCoherence;

        // Check previous two calibration trials
        if (
          previousTrialData[0].correct === 1 &&
          previousTrialData[1].correct === 1
        ) {
          // If both of the two previous trials are correct, check if the
          // coherence value was adjusted
          if (
            previousTrialData[0].activeCoherence === previousTrialData[1].activeCoherence
          ) {
            // If the coherence value hasn't been adjusted, decrease it.
            trial.data.activeCoherence = parseFloat(
              (previousTrialData[1].activeCoherence - 0.01).toFixed(3)
            );
          }
        } else if (previousTrialData[1].correct === 0) {
          // Else increase coherence value if the previous trial was
          // incorrect
          trial.data.activeCoherence = parseFloat(
            (previousTrialData[1].activeCoherence + 0.01).toFixed(3)
          );
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
      this.jsPsych.finishTrial();
    };

    const previousData = this.jsPsych.data.get().last(2).values();
    if (trial.name === "calibration") {
      if (
        previousData[0].name === "calibration" &&
        previousData[1].name === "calibration"
      ) {
        adjustCalibrationCoherence();
      }
    } else if (trial.name === "main") {
      // Check if this is the first main trial
      const previousTrial = previousData[0];

      // Calculate the median coherence to use in the coming trials
      if (previousTrial.name !== "main" && trial.data.number === 0) {
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
        trial.data.coherences = [kMedian * 0.5, kMedian * 2.0];
      } else {
        // Else re-use the coherence from previous main calibration
        // trials
        trial.data.coherences = previousData[1].coherences;
        trial.coherences = previousData[1].coherences;
      }

      // Pick either high or low coherence
      trial.data.activeCoherence =
        trial.data.coherences[
          Math.floor(Math.random() * trial.data.coherences.length)
        ];
      trial.activeCoherence = trial.data.activeCoherence;
    }

    // Setup the properties of each stimulus used in the trial.
    // Initial display of the fixation cross.
    const initial = {
      name: "initial",
      components: ["outline", "fixation"],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      selected: false,
      timing: {
        pre: 0,
        run: 1000,
        post: 0,
      },
      target: display_element,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the dots in motion.
    const motion = {
      name: "motion",
      components: ["outline", "fixation", "dots"],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      selected: false,
      timing: {
        pre: 0,
        run: trial.motionDuration,
        post: 0,
      },
      target: display_element,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the reference angle and the coloured arcs for
    // user selection.
    const decision = {
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
      selected: false,
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
      target: display_element,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionKeyDownHandler,
      postTrialHandler: nextStimulus,
    };

    // Brief display of the fixation cross.
    const postDecision = {
      name: "post-decision",
      components: ["outline", "fixation"],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      selected: false,
      timing: {
        pre: 0,
        run: -1, // Wait indefinitely until all keys are released
        post: 0,
      },
      target: display_element,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Construct a list of the stimuli.
    const stimuli = [];
    stimuli.push(
      new Stimulus(initial),
      new Stimulus(motion),
      new Stimulus(decision),
      new Stimulus(postDecision)
    );

    let currentStimulus = null;
    trial.data.trialStart = performance.now();

    // Make the keyup handler globally accessible
    window.decisionKeyUpHandler = decisionKeyUpHandler;

    nextStimulus();
  }
}

export default DotGamePlugin;
