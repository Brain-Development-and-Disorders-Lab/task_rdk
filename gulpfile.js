// Gulp modules
const gulp = require("gulp");

// Other modules
const del = require("del");

/**
 * Primary build pipeline
 * @param {() => void} cb callback function
 */
const artefacts = (cb) => {
  // Copy all stimuli to build output
  gulp.src("./src/stimuli/**/*").pipe(gulp.dest("./dist/stimuli/"));
  // Copy all resources to build output
  gulp.src("./src/resources/**/*").pipe(gulp.dest("./dist/resources/"));
  cb();
};

/**
 * Clean up build artefacts
 * @param {() => void} cb callback function
 */
const clean = (cb) => {
  del(["dist", "task_rdk-v?.?.?.tgz"]);
  cb();
};

exports.artefacts = artefacts;
exports.clean = clean;
exports.default = artefacts;
