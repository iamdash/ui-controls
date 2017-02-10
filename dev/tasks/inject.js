var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    usemin = require('gulp-usemin'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglifyjs'),
    rev = require('gulp-rev');

gulp.task('wiredep', function () {

    return gulp.src('./app/**/*.html')
        .pipe(wiredep({
            exclude: [],
            ignorePath: ['node_modules']
        }))
        .pipe(gulp.dest('app'));
});


gulp.task('usemin', function () {

    return gulp.src('./app/**/*.html')
        .pipe(usemin())
        .pipe(gulp.dest('app'));
});
