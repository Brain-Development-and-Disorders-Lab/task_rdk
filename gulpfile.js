// Gulp modules
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const zip = require('gulp-zip');

// Webpack modules
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");

// Other modules
const del = require('del');

/**
 * Primary build pipeline
 * @param {function} cb callback function
 */
 function build(cb) {
  // Run the Webpack build, then move the images
  webpack(webpackConfig, () => {
    gulp.src("./src/img/**/*").pipe(gulp.dest("./built/img/"));
  });
  cb();
}

/**
 * Run the style checker
 * @param {function} cb callback function
 */
function style(cb) {
  gulp.src(['**/*.ts', '**/*.js', '!node_modules/**'])
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
  del(['built', 'rdk.zip']);
  cb();
}

/**
 * Generate a compressed archive of the 'built/'
 * sub-directory.
 * @param {function} cb callback function
 */
 function package(cb) {
  gulp.src('built/*')
    .pipe(zip('rdk.zip'))
    .pipe(gulp.dest('./'));
  cb();
}

exports.build = build;
exports.clean = clean;
exports.style = style;
exports.package = package;
exports.default = style;