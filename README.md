# Random Dot Kinematogram (RDK) Task

This task is built with the [jsPsych](https://www.jspsych.org/6.3/) 6.3 library using TypeScript. The source code of the experiment is located under the `src` directory. The jsPsych experiment timeline is setup in `index.ts`. The jsPsych plugin is defined in `plugin.ts`. Interoperability across online and in-person delivery is enabled using the [`Neurocog.js`](https://github.com/Brain-Development-and-Disorders-Lab/Neurocog.js) library.

Experimental and Neurocog.js configuration is defined in `configuration.ts`, and other utility functions are defined in `functions.ts`. The `classes` subdirectory containes class definitions for core components of the RDK stimuli and plugin runtime classes. The `css` subdirectory contains styling definitions, and the `img` subdirectory contains graphic stimuli used in the experiment.

Unit tests are defined in the `test` directory, and the TypeScript type definitions are contained in the `types` directory.

## Development

This project uses `yarn` to manage dependencies. Install dependencies using the `yarn` command.

To start a development server that will rebuild the code on any changes, run `yarn dev`. The task can be accessed at [localhost:8080](http://localhost:8080).

To run unit tests, run `yarn test`. To execute the code styling utility on all source code, run `yarn style`. To clean up build artefacts, run `yarn clean`.

## Delivery

To deliver this task online or offline, run `yarn build` to generate a minimised and bundled output that includes all stimuli, source code, and an `index.html` file. To deliver this task offline, simply open `index.html` in a browser of choice. To deliver this task online, upload the `index.bundle.js` output file to a Gorilla project. Further documentation about online deliver can be found with [`Neurocog.js`](https://github.com/Brain-Development-and-Disorders-Lab/Neurocog.js).
