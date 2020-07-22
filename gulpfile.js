/*global -$ */
'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('styles', function(done) {
  gulp.src('app/scss/*.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('app/css/'))
    .on('end', done);
});

gulp.task('serve', gulp.series(['styles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['app']
    }
  });

  // watch for changes
  gulp.watch([
    'app/*.html',
    'app/js/**/*.js'
  ]).on('change', reload);
}));

gulp.watch('app/scss/**/*.scss', gulp.series(['styles'])).on('change', reload);;
