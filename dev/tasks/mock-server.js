var gulp = require('gulp'),
    path = require('path'),
    sass = require('gulp-sass'),
    browserSync = require("browser-sync"),
    watch = require('gulp-watch'),
    less = require('gulp-less'),
    concat = require('gulp-concat');


// Start the server
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: "."
        }
    });
});

//Compile SASS & auto-inject into browsers
gulp.task('sass', function () {

    return gulp.src(['./dev/sass/**/*.scss'])
        .pipe(sass({
            errLogToConsole: true,
            style: 'compressed'
        }))
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.reload({stream: true}));

});

gulp.task('less', function () {
    return gulp.src('./dev/less/main.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less')]
        }))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./app/css'));
});

// Reload all Browsers
gulp.task('bs-reload', function () {
    browserSync.reload();
});


gulp.task('mock-server', ['browser-sync', 'less'], function () {

    watch("./dev/**/*.scss", function () {
        gulp.start('sass');
    });

    gulp.watch(["./*.html","./app/**/*.html", "./app/**/*.js", "./app/**/*.css"], ['bs-reload']);
});
