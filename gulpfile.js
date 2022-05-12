// Gulp modules
const gulp = require("gulp");
const eslint = require("gulp-eslint");

// Other modules
const del = require("del");

/**
 * Run the style checker
 * @param {function} cb callback function
 */
function style(cb) {
  gulp
    .src(["**/*.ts", "**/*.js", "!node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  cb();
}

/**
 * Clean up build artefacts
 * @param {function} cb callback function
 */
function clean(cb) {
  del(["built", "rdk.zip"]);
  cb();
}

exports.clean = clean;
exports.style = style;
exports.default = style;
