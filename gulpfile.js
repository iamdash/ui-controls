var gulp            = require('gulp'),
    requireDir      = require('require-dir');

requireDir('./dev/tasks');

gulp.task('default', ['mock-server'], function () {});
