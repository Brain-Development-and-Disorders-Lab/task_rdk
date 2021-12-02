# RDK Task

## Overview

The best place to start is the `main.ts` file in the `/src` directory. This is the entry point for webpack when compiling the code, and essentially creates the entire timeline of the experiment.

`config.js` is used to specify parameters unique to the task such as timing and keymappings.

## Getting Started

To get started with development, run `yarn dev`. This will start a webpack development server which can be accessed at [localhost:8080](http://localhost:8080).

To bundle the tasks for administration via Gorilla or on a desktop, run `yarn build`. The `target` parameter in `config.js` must be set to either `desktop` or `gorilla` depending on the intended use.

To run the style-checker, run `yarn style`.

## Files

### /core

There are a few important files in the `/core` directory.

- `lib.ts` defines a collection of classes used as abstractions of lower-level JavaScript operations. It contains classes such as `Graphics` and `Runner`.
- `plugin.ts` defines the plugin object used by jsPsych in the timeline. This contains the logic to start and end each trial. It also handles data collation.
- `util.ts` contains utilities such as an image loader.

### /css

Any styling used for the experiment is included here.

### /img

All stimuli are stored in this directory as `.png` or `.svg` files.

### /trials (optional)

Contains a Python script used to generate the trials prior to running the experiment. The script output `trials.json` which can be imported by `util.ts` prior to running the trials in the browser.

