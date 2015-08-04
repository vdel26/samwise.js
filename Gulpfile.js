var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var eslint = require('gulp-eslint');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('js', function() {
  var shim = 'node_modules/es6-collections/es6-collections.js';
  return gulp.src([shim, 'src/js/**/*.js'])
    .pipe(concat('samwise.js'))
    .pipe(babel())
    .pipe(gulp.dest('.'));
});

gulp.task('scss', function () {
  return gulp.src('src/css/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('.'))
    .pipe(reload({ stream: true }));
});

gulp.task('lint', function () {
  return gulp.src('src/js/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', function () {
  return gulp.src('test/index.html')
    .pipe(mochaPhantomJS());
});

gulp.task('serve', ['scss', 'js'], function() {
  browserSync({
    server: {
      baseDir: './',
      index: 'example/index.html'
    }
  });

  gulp.watch('src/css/**/*.scss', ['scss']);
  gulp.watch('src/js/**/*.js', ['js']);
});
