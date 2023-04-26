// Gulp modules
const gulp = require("gulp");

// Other modules
const del = require("del");

/**
 * Primary build pipeline
 * @param {() => void} cb callback function
 */
const resources = (cb) => {
  // Copy all stimuli to build output
  gulp.src("./src/img/**/*").pipe(gulp.dest("./dist/img/"));
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

exports.resources = resources;
exports.clean = clean;
exports.default = resources;
