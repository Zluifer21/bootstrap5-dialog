// Gulpfile.js

"use strict";
const fs   = require('fs');

var gulp = require("gulp"),
    sass = require("gulp-sass")(require('node-sass')),
    minifyCSS = require("gulp-minify-css"),
    notify = require("gulp-notify"),
    clean = require("gulp-clean"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify");

gulp.task("sass", function (cb) {
    gulp.src("src/scss/bootstrap-dialog.scss")
        .pipe(sass())
        .pipe(gulp.dest("dist/css"))
        .pipe(rename("bootstrap-dialog.min.css"))
        .pipe(minifyCSS())
        .pipe(gulp.dest("dist/css"))
        .pipe(notify({
            message: "SASS task completed."
        }));

    cb();
});

gulp.task("js", function (cb) {
    gulp.src(["src/js/bootstrap-dialog.js"])
        .pipe(gulp.dest("dist/js"))
        .pipe(rename("bootstrap-dialog.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"))
        .pipe(notify({
            message: "JS task completed."
        }));

    cb();
});

gulp.task("clean", function (cb) {
    gulp.src(["dist/"], { read: false, allowEmpty: true })
        .pipe(clean())

    cb();
});

gulp.task("setup", function (cb) {
    gulp.src(["src/*"], { read: false, allowEmpty: true })
        .pipe(gulp.dest("dist/"))
    cb();
});

gulp.task("examples", function (cb) {
    gulp.src(["node_modules/bootstrap/dist/css/bootstrap.min.css"])
        .pipe(gulp.dest("examples/libs"))
    gulp.src(["node_modules/bootstrap/dist/js/bootstrap.min.js"])
        .pipe(gulp.dest("examples/libs"))
    cb();
});

gulp.task("default", gulp.series("clean", "setup", gulp.parallel("js", "sass"), "examples"));

gulp.task('watch', function() {
    gulp.series("default")
    gulp.watch('src/js/*.js', gulp.series("js"))
    gulp.watch('src/sass/*', gulp.series("sass"))
});
