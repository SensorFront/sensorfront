var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var tslint = require("gulp-tslint");
var rimraf = require("gulp-rimraf");
var jasmine = require('gulp-jasmine');
var exec = require('child_process').exec;
var args = require('yargs').argv;

var tsProject = ts.createProject("tsconfig.json");

gulp.task("clean", function () {
    return gulp.src(["dist"], {
        read: false
    }).pipe(rimraf());
});

gulp.task("ts:lint", function () {
    return gulp.src(["typescript/**/*.ts"])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task("ts:compile", ["ts:lint"], function () {
    var tsResult = gulp.src([
            "typescript/**/*.ts",
            "../shared/**/*.ts"
        ], {
            base: "./"
        })
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return tsResult.js
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/backend"));
});

gulp.task("copy:i18n", function () {
    return gulp.src(["i18n/{**,./}/*.json"], {
            base: "./"
        })
        .pipe(gulp.dest("dist/backend"));
});

gulp.task("ts:watch", ["ts:compile"], function () {
    gulp.watch(["typescript/**/*.ts", "../shared/**/*.ts"], ["ts:compile"]);
    gulp.watch(["i18n/*.*"], ["copy:i18n"]);
});

gulp.task('serve', ["copy:i18n", "ts:watch"], function () {
    nodemon({
            script: 'dist/backend/typescript/server.js',
            "verbose": false,
            "delay": 1000,
            "ignore": ["**/*.js.map", "**/*.spec.js", "**/*.log"],
            "execMap": {
                "js": "node --harmony"
            }
        })
        .on('restart', function () {
            console.log('              [gulp] Sensor Front Backend Server: restarted [OK]');
        });
});

gulp.task('servedebug', ["copy:i18n", "ts:watch"], function () {
    nodemon({
            script: 'dist/backend/typescript/server.js',
            "verbose": false,
            "delay": 1000,
            "ignore": ["**/*.js.map", "**/*.spec.js", "**/*.log"],
            "execMap": {
                "js": "node --harmony --debug"
            }
        })
        .on('restart', function () {
            console.log('              [gulp] Sensor Front Backend Backend Server: restarted [OK]');
        });
});

gulp.task('seed', ["ts:compile", "copy:i18n"], function (cb) {
    exec('node dist/backend/typescript/data/seed.js --color', function (err, stdout, stderr) {
        if (stdout) {
            console.log(stdout);
            cb();
        }
        if (err) {
            console.log(err);
            cb(err);
        }
    });
});

gulp.task('export', ["ts:compile"], function (cb) {
    exec('node dist/backend/typescript/data/export.js --color', function (err, stdout, stderr) {
        if (stdout) {
            console.log(stdout);
            cb();
        }
        if (err) {
            console.log(err);
            cb(err);
        }
    });
});

gulp.task("copy:resources", function (params) {
    return gulp.src(["package.json"])
        .pipe(gulp.dest("dist/"));
});

gulp.task('test', ['ts:compile'], function () {
    var pattern = ['dist/{**,./}/*.spec.js'];
    if (args.test) {
        pattern = ['dist/{**,./}/' + args.test + '.spec.js'];
    }
    console.log('\nRunning tests with pattern ' + args.test);
    return gulp.src(pattern).pipe(
        jasmine({
            verbose: true,
            includeStackTrace: true,
            config: {
                stopSpecOnExpectationFailure: false,
                random: false
            }
        })
    );
});

gulp.task('default', ['ts:watch']);