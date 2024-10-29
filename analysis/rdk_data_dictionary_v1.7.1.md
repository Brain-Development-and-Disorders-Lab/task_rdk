# RDK Task - Data Dictionary

> Version 1.7.1

Latest 'slider' confidence input version. Release generated May 14, 2023.

Browse files: [https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/tree/v1.7.1](https://github.com/Brain-Development-and-Disorders-Lab/task_rdk/tree/v1.7.1)

## Data

### General

- `trialNumber`: Number of elapsed trials, indexed from `0`.
- `score`: Total number of correct responses, counting `dot-game`-type `main` trials only (not calibration or practice trials).
- `deviation`: The direction of the coherent dots, either `left` or `right`.
- `correct`: Whether the participant selected the correct direction of the coherent dots, either `true` or `false`.
- `coherence`: The current proportion of coherent dots being presented during the moving dots stimulus. Example: A value of `0.13` indicates 13% of dots on-screen will be coherent, the remaining 87% will be random distractor dots.
- `coherences`: Generated low and high coherence pairs, `[low, high]`. Calculated as `[kMedian * 0.5, kMedian * 2.0]`, where `kMedian <= 0.5 && kMedian >= 0.12`.

### Confidence

- `confidenceSelection`: The selected slider value, between `0.5` and `1.0`.
- `confidenceMistake`: `true` or `false`, representing the participant pressing the mistake button on the confidence slider screen.

### Timing

- `trialStartTime`: Timestamp of when the start of the trial is invoked.
- `trialEndTime`: Timestamp of when the trial is ended and the next trial invoked.
- `trialTotalTime`: Total duration of the trial presentation.
- `referenceStartTime`: Timestamp of when the start of the dot direction decision is presented.
- `referenceEndTime`: Timestamp of when the direction is selected and the selection is stored.
- `referenceTotalTime`: Total duration of the direction decision being presented and the participant making a selection.
- `confidenceStartTime`: Timestamp of when the start of the confidence slider is presented.
- `confidenceEndTime`: Timestamp of when the confidence value has been selected and the trial continues.
- `confidenceTotalTime`: Total duration of the confidence slider being presented and the participant making a slider selection.
- `stimulusDuration`: Total duration that the moving dot stimulus is presented for (default is `1500` milliseconds).

## Trial Structure

1. `initial`: Presenting a fixation cross for `1000` milliseconds.
2. `motion`: Presenting the dot motion for `trial.stimulusDuration` milliseconds (default `1500`).
3. `reference`: Presenting the dot direction decision, no time limit.
4. `decision`: Presenting a fixation cross for `250` milliseconds.
5. `confidence`: Presenting the confidence selection slider **if enabled on that trial**, no time limit.

## Notes

- Due to inaccuracies when using millisecond-precision timing alongside complex 2D rendering on the web, the result for `trialTotalTime` is typically between `65`-`75` milliseconds **greater** than the sum of other `-TotalTime` values and fixed durations.
