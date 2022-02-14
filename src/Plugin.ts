/**
 * @summary Main jsPsych plugin file for Bang et al. RDK task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/rdk/src/core/plugin.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */
// Stylesheets
import 'jspsych/css/jspsych.css';
import './css/styles.css';
import './css/buttons.css';

// Additional functions
import {scaling} from './lib/Functions';

// Core modules
import {Graphics, Renderer, Stimulus, Runner} from './lib/Runtime';

// Configuration
import {Configuration} from './Configuration';

// External libraries
import Two from 'two.js';

jsPsych.plugins['dot-game'] = (function() {
  const plugin = {
    info: {},
    trial: function(displayElement: HTMLElement, trial: any) {
      console.error(`This needs to be defined!`);
    },
  };

  // Instantiate the parameters and information of the plugin.
  plugin.info = {
    name: 'dot-game',
    parameters: {},
  };

  /**
     * Main function used by jsPsych to run the trial.
     * @param {HTMLElement} displayElement Element on the webpage consisting of the
     * HTML displaying the trial.
     * @param {any} trial Attributes of the trial.
     */
  plugin.trial = function(displayElement: HTMLElement, trial: any) {
    // Setup variables.
    const distanceFromScreen = trial.distance;

    // Setup distance-related variables.
    let viewRadius = Math.ceil(Math.abs(
        distanceFromScreen * Math.tan(8)));
    let dotRadius = Math.ceil(Math.abs(
        distanceFromScreen * Math.tan(0.12)));

    // Setup Two.js.
    let width = viewRadius * 2 + 10;
    let height = viewRadius * 2 + 10;

    // Apply scaling
    if (height > window.innerHeight * Configuration.scalingDefault) {
      height *= scaling();
      width *= scaling();
      viewRadius *= scaling();
      dotRadius *= scaling();
    }

    const keyLayout = trial.keyLayout;

    // Instantiate new <div> container for graphics elements
    const containerDiv = document.createElement('div');
    containerDiv.className = 'graphics-container';
    displayElement.appendChild(containerDiv);
    const childDiv = document.createElement('div');
    containerDiv.appendChild(childDiv);

    // Setup the renderer parameters.
    const rendererParameters = {
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

    let renderer = new Renderer(two, rendererParameters);
    let graphics = new Graphics(trial, renderer);

    // Setup data-related variables.
    let selection = '';

    // Compute the trial number
    trial.data.trialNumber = 0;
    const previousTrialCollection = jsPsych.data.get().values();
    previousTrialCollection.forEach((storedTrial) => {
      if (storedTrial.trial_type === 'dot-game') {
        trial.data.trialNumber = storedTrial.trialNumber + 1;
      }
    });

    // Compute the trial score
    if (trial.name === 'main') {
      trial.data.score = 0;
      previousTrialCollection.forEach((storedTrial) => {
        if (storedTrial.trial_type === 'dot-game') {
          if (storedTrial.name === 'main') {
            trial.data.score = storedTrial.score;
          }
        }
      });
    }

    const previousData = jsPsych.data.get().last(2).values();
    if (trial.name === 'calibration') {
      if (previousData[0].name === 'calibration' &&
        previousData[1].name === 'calibration') {
        adjustCalibrationCoherence();
      }
    } else if (trial.name === 'main') {
      // Check if this is the first main trial
      const previousTrial = previousData[0];

      // Calculate the median coherence to use in the coming trials
      if (previousTrial.name !== 'main' && trial.data.number === 0) {
        // If this is the first, compute the median of the last 20 trials
        let kMedian =
          jsPsych.data.get().last(21).select('coherence').median();

        // Adjust coherence to constrain it within [0.12, 0.50]
        if (kMedian > 0.50) {
          kMedian = 0.50;
        } else if (kMedian < 0.12) {
          kMedian = 0.12;
        }

        // Generate the list of coherences
        trial.data.coherences = [
          kMedian * 0.5,
          kMedian * 2.0,
        ];
      } else {
        // Else re-use the coherence from previous main calibration
        // trials
        trial.data.coherences = previousData[1].coherences;
        trial.coherences = previousData[1].coherences;
      }

      // Pick either high or low coherence
      trial.data.coherence = trial.data.coherences[
          Math.floor(Math.random() * trial.data.coherences.length)
      ];
      trial.coherence = trial.data.coherence;
    }

    // Setup the properties of each stimulus used in the trial.
    // Initial display of the fixation cross.
    const initial = {
      name: 'initial',
      components: ['outline', 'fixation'],
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
      target: displayElement,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the dots in motion.
    const motion = {
      name: 'motion',
      components: ['outline', 'fixation', 'dots'],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      selected: false,
      timing: {
        pre: 0,
        run: trial.stimulusDuration,
        post: 0,
      },
      target: displayElement,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the reference angle and the coloured arcs for
    // user selection.
    const reference = {
      name: 'reference',
      components: [
        'outline',
        'fixation',
        'left',
        'right',
        'left_arc',
        'right_arc',
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
        [keyLayout.left]: {
          choice: 'left',
          handler: decisionHandler,
        },
        [keyLayout.right]: {
          choice: 'right',
          handler: decisionHandler,
        },
      },
      target: displayElement,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Brief display of the fixation cross.
    const decision = {
      name: 'decision',
      components: ['outline', 'fixation'],
      two: two,
      renderer: renderer,
      graphics: graphics,
      interactive: false,
      selected: false,
      timing: {
        pre: 0,
        run: 250,
        post: 0,
      },
      target: displayElement,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Display of the confidence slider used to rate confidence.
    const confidence = {
      name: 'confidence',
      components: ['confidence'],
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
        [keyLayout.submit]: {
          choice: 'submit',
          handler: decisionHandler,
        },
        [keyLayout.left]: {
          choice: 'decrease',
          handler: decisionHandler,
        },
        [keyLayout.right]: {
          choice: 'increase',
          handler: decisionHandler,
        },
      },
      target: displayElement,
      trial: trial,
      rendererParameters: rendererParameters,
      eventHandler: decisionHandler,
      postTrialHandler: nextStimulus,
    };

    // Construct a list of the stimuli.
    const stimuli: Stimulus[] = [];
    stimuli.push(
        new Stimulus(initial),
        new Stimulus(motion),
        new Stimulus(reference),
        new Stimulus(decision),
    );

    if (trial.checkConfidence === true) {
      // Exception for tutorial trials, confidence should be shown
      // for all trials
      stimuli.push(new Stimulus(confidence));
    }

    let currentStimulus: Stimulus;
    trial.data.trialStartTime = Date.now();

    nextStimulus();

    /**
      * Iterates through each of the stimuli by popping a stimulus from the
      * front of the stimuli list. Activates that stimulus using the Runner
      * class. Calls `endTrial()` if all stimuli have been displayed for the
      * trial.
      */
    function nextStimulus() {
      // End the trial if there are no more stimuli to display
      if (stimuli.length === 0) {
        trial.data.trialEndTime = Date.now();
        trial.data.trialTotalTime = trial.data.trialEndTime -
          trial.data.trialStartTime;

        // End of the trial, all stimuli have been displayed.
        endTrial();
        return;
      }

      // Clear display before retrieving the next stimuli to display.
      currentStimulus = stimuli.shift();

      // Configure stimulus-specific parameters
      if (currentStimulus.getParameters().name === 'reference') {
        trial.data.referenceStartTime = Date.now();

        // Hide the mouse cursor
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === 'confidence') {
        // Start a timer if a reference or confidence stimuli is run.
        trial.data.confidenceMistake = false;
        trial.data.confidenceStartTime = Date.now();

        // Show the mouse cursor
        graphics.cursorVisibility(true);

        // Download a copy of the current data
        if (Configuration.target === 'desktop' || Configuration.keys === 'spectrometer') {
          jsPsych.data.get().localSave(`csv`, `dots_part_${Date.now()}.csv`);
        }
      } else if (currentStimulus.getParameters().name === 'motion') {
        trial.data.stimulusDuration =
            currentStimulus.getParameters().timing.run;

        // Hide the mouse cursor
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === 'initial') {
        // Hide the mouse cursor
        graphics.cursorVisibility(false);
      } else if (currentStimulus.getParameters().name === 'decision') {
        // Increase the run time of fixation cross to 1250ms if feedback
        // is to be shown
        if (trial.showFeedback === true) {
          currentStimulus.getParameters().timing.run = 1250;
        }
      } else {
        // Show the mouse cursor
        graphics.cursorVisibility(true);
      }

      // Start the stimulus
      Runner.start(currentStimulus);
    }

    /**
      * An event handler for decision made during a trial
      * @param {Event} event the particular event or keypress
      */
    function decisionHandler(event: KeyboardEvent) {
      // Record the keycode to process the event
      const keycode = event.key;

      if (keycode === keyLayout.left ||
          keycode === keyLayout.right ||
          keycode === keyLayout.submit) {
        // Prevent participant from proceeding if they haven't selected a
        // confidence value.
        if (currentStimulus.getParameters().name === 'confidence' &&
            keycode === keyLayout.submit &&
            document.getElementById('confidence-slider').className ===
              'confidence-slider-hidden') {
          // Console warning
          console.warn(`No confidence selected!`);
        } else if (currentStimulus.getParameters().name === 'confidence' &&
          keycode !== keyLayout.submit) {
          // Show the thumb
          const slider = <HTMLInputElement>
              document.getElementById('confidence-slider');
          slider.className ='confidence-slider';

          // Handle the key that was pressed
          if (keycode === keyLayout.left) {
            // Decrease the confidence
            slider.stepDown(1);
          } else if (keycode === keyLayout.right) {
            // Increase the confidence
            slider.stepUp(1);
          }
        } else {
          // Progress to the next state
          selection = currentStimulus.getParameters()
              .keybindings[keycode].choice;
          currentStimulus.removeKeybindings();

          if (currentStimulus.getParameters().name === 'reference') {
            // Calculate and store reference data
            trial.data.referenceEndTime = Date.now();
            trial.data.referenceTotalTime =
              trial.data.referenceEndTime -
              trial.data.referenceStartTime;
            trial.data.referenceSelection = selection === 'left' ? 1 : 2;
            trial.data.correct = selection === trial.data.deviation ? 1 : 0;
            if (trial.data.correct === 1 && trial.name === 'main') {
              trial.data.score ++;
            }
          } else if (currentStimulus.getParameters().name === 'confidence') {
            // Calculate and store confidence data
            const slider = <HTMLInputElement>
                document.getElementById('confidence-slider');
            trial.data.confidenceEndTime = Date.now();
            trial.data.confidenceTotalTime = trial.data.confidenceEndTime -
              trial.data.confidenceStartTime;
            trial.data.confidenceSelection = slider.value;
          }

          // Invoke the post method of the Runner
          Runner.post(currentStimulus);
        }
      } else if (currentStimulus.getParameters().name === 'confidence') {
        if (Configuration.keys === 'spectrometer' &&
            keycode === keyLayout.alt) {
          // If the mistake button has been triggered in the spectrometer,
          // note the mistake and timing accordingly
          const slider = <HTMLInputElement>
              document.getElementById('confidence-slider');
          trial.data.confidenceSelection = slider.value;
          trial.data.confidenceMistake = true;
          trial.data.confidenceEndTime = Date.now();
          trial.data.confidenceTotalTime = trial.data.confidenceEndTime -
              trial.data.confidenceStartTime;

          console.info('Mistake stored alongside trial data.');

          // Clean up event listeners
          document.removeEventListener('keyup',
              currentStimulus.getParameters().eventHandler);

          // Continue with trial
          Runner.post(currentStimulus);
        } else if (Configuration.keys === 'desktop' &&
            (event.type === 'click' || keycode === keyLayout.alt)) {
          // If the mistake button has been triggered on a desktop,
          // note the mistake and timing accordingly
          const slider = <HTMLInputElement>
              document.getElementById('confidence-slider');
          trial.data.confidenceSelection = slider.value;
          trial.data.confidenceMistake = true;
          trial.data.confidenceEndTime = Date.now();
          trial.data.confidenceTotalTime = trial.data.confidenceEndTime -
              trial.data.confidenceStartTime;

          console.info('Mistake stored alongside trial data.');

          // Continue with trial
          Runner.post(currentStimulus);
        }
      }
    }

    /**
      * Adjusts coherence level based on calibration data
      */
    function adjustCalibrationCoherence() {
      // Get the previous data from trials
      const previousTrialData = jsPsych.data.get().last(2).values();

      // Determine how many trials have elapsed
      if (previousTrialData[0] !== undefined) {
        // One trial must have elapsed, retrieve the most recent coherence
        trial.data.coherence = previousTrialData[1].coherence;

        // Check previous two calibration trials
        if (previousTrialData[0].correct === 1 &&
            previousTrialData[1].correct === 1) {
          // If both of the two previous trials are correct, check if the
          // coherence value was adjusted
          if (previousTrialData[0].coherence ===
              previousTrialData[1].coherence) {
            // If the coherence value hasn't been adjusted, decrease it.
            trial.data.coherence = parseFloat((previousTrialData[1]
                .coherence - 0.01).toFixed(3));
          }
        } else if (previousTrialData[1].correct === 0) {
          // Else increase coherence value if the previous trial was
          // incorrect
          trial.data.coherence = parseFloat((previousTrialData[1]
              .coherence + 0.01).toFixed(3));
        }
      }
    }

    /**
      * End the trial
      */
    function endTrial() {
      // Clean up renderer and graphics
      renderer.clearElements();
      Two.Instances.pop();
      displayElement.innerHTML = '';

      // Finalise the trial
      jsPsych.finishTrial();
    }
  };

  return plugin;
})();
