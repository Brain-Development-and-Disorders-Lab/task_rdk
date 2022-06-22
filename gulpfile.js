// Gulp modules
const gulp = require("gulp");

// Webpack
const webpack = require("webpack");

// Other modules
const del = require("del");

/**
 * Primary build pipeline
 * @param {() => void} cb callback function
 */
const build = (cb) => {
  // Run the Webpack build, then move the images
  webpack(require("./webpack.config"), () => {
    gulp.src("./src/img/**/*").pipe(gulp.dest("./built/img/"));
  });
  cb();
};

/**
 * Clean up build artefacts
 * @param {() => void} cb callback function
 */
const clean = (cb) => {
  del(["built"]);
  cb();
};

exports.build = build;
exports.clean = clean;
exports.default = build;
