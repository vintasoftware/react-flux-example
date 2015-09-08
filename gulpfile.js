'use strict';
// based on:
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
// http://www.browsersync.io/docs/gulp/
// https://gist.github.com/mlouro/8886076

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require("babelify");
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();

var distDir = "./dist";
var port = 8000;


//// js bundler with browserify + babelify + watchify

gulp.task('js', function() {
  var browserifyOpts = {
    entries: ['./js/main.jsx'],
    debug: true,
    cache: {}
  };
  var opts = assign({}, watchify.args, browserifyOpts);
  var bundler = watchify(browserify(opts)); 

  // add browserify transformations here
  bundler.transform(babelify.configure({
    stage: 1
  }));

  var rebundle = function() {
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      .pipe(buffer())
      // optional, remove if you dont want sourcemaps
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      // Add JS transformation tasks to the pipeline here
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest(distDir));
  }
  // on any dep update, runs the bundler
  bundler.on('update', rebundle);
  // output build logs to terminal
  bundler.on('log', gutil.log);

  return rebundle();
});


//// local serve with browser-sync, supports live reloads

// task that ensures the `js` task is complete before reloading browsers
gulp.task('reload-js', ['js'], function() {
  browserSync.reload();
});

gulp.task('serve', ['js'], function() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: port
  });

  gulp.watch("./js/*.jsx", ['reload-js']);
});
