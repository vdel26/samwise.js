var gulp = require('gulp');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('.'));
});

gulp.task('scss', function () {
  return gulp.src('src/css/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('.'))
    .pipe(reload({ stream: true }));
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