const gulp = require('gulp');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const panini = require('panini');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

const path_src = {
  html: 'src/html',
  css: 'src/scss',
  js: 'src/js',
  img: 'src/img',
  modules: {
    jquery: 'node_modules/jquery/dist',
    popper: 'node_modules/popper.js/dist/umd',
    bootstrap: 'node_modules/bootstrap/dist/js'
  }
}
const path_output = {
  dev: {
    html: 'build',
    css: 'build/assets/css',
    js: 'build/assets/js',
    img: 'build/assets/img'
  },
  prod: {
    html: 'dist',
    css: 'dist/assets/css',
    js: 'dist/assets/js',
    img: 'dist/assets/img'
  }  
}


// html

gulp.task('html:compile:dev', () => {
  gulp.src(`${path_src.html}/pages/**/*.html`)
    .pipe(panini({
      root: `${path_src.html}/pages/`,
      layouts: `${path_src.html}/layouts/`,
      partials: `${path_src.html}/partials/`,
      helpers: `${path_src.html}/helpers/`,
      data: `${path_src.html}/data/`
    }))
    .pipe(gulp.dest(path_output.dev.html));
});

gulp.task('html:compile:reset', (done) => {
  panini.refresh();
  done();
});


// js dev

gulp.task('js:concat:dev', ['js:copy:dev'], () => {
    gulp.src([
        `${path_src.modules.jquery}/jquery.js`, 
        `${path_src.modules.popper}/popper.js`,
        `${path_src.modules.bootstrap}/bootstrap.js`,
        `${path_src.js}/custom.js`])
      .pipe(sourcemaps.init())
      .pipe(concat('scripts.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path_output.dev.js));
});
gulp.task('js:copy:dev', () => {
    gulp.src(`${path_src.js}/other/*.js`)
      .pipe(gulp.dest(path_output.dev.js));
});


// sass

gulp.task('sass:compile:dev', () =>{
    gulp.src([`${path_src.css}/*.scss`])
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: 'compact', sourceComments: 'true' }).on('error', sass.logError))
        .pipe(autoprefixer())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path_output.dev.css));
});


// images

gulp.task('img:copy:dev', () => {
    gulp.src(`${path_src.img}/**/*`)
        .pipe(imagemin())
        .pipe(gulp.dest(path_output.dev.img));
});


// serve

gulp.task('serve', ['html:compile:dev', 'js:concat:dev', 'sass:compile:dev', 'img:copy:dev'], () => {
    browserSync.init({
        server: {
            baseDir: path_output.dev.html
        }
    });

    gulp.watch(`${path_src.html}/pages/**/*`, ['html:compile:dev']);
    gulp.watch(`${path_src.html}/{layouts,partials,helpers,data}/**/*`, ['html:compile:reset','html:compile:dev']);
    gulp.watch(`${path_src.css}/**/*`, ['sass:compile:dev']);
    gulp.watch(`${path_src.js}/**/*`, ['js:concat:dev']);
    gulp.watch([
      `${path_output.dev.html}/**/*.html`, 
      `${path_output.dev.js}/*.js`,
      `${path_output.dev.css}/*.css`,
      `${path_output.dev.img}/**/*`,
    ]).on('change', browserSync.reload);
});


// default

gulp.task('default', ['serve']);







gulp.task('sass:compile:prod', () => {
    gulp.src([`${path_src.css}/*.scss`])
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(gulp.dest(path_output.prod.css));
});

gulp.task('img:copy:prod', () =>{
    gulp.src(`${path_src.img}/**/*`)
        .pipe(imagemin())
        .pipe(gulp.dest(path_output.prod.img));
});

gulp.task('js:concat:prod', ['js:copy:prod'], () => {
    gulp.src([
        `${path_src.modules.jquery}/jquery.js`, 
        `${path_src.modules.popper}/popper.js`,
        `${path_src.modules.bootstrap}/bootstrap.js`,
        `${path_src.js}/custom.js`])
      .pipe(concat('scripts.js'))
      .pipe(uglify())
      .pipe(gulp.dest(path_output.prod.js));
});

gulp.task('js:copy:prod', () => {
    gulp.src(`${path_src.js}/other/*.js`)
      .pipe(uglify())
      .pipe(gulp.dest(path_output.prod.js));
});


gulp.task('html:compile:prod', () =>{
    gulp.src(`${path_src.html}/pages/**/*.html`)
      .pipe(panini({
        root: `${path_src.html}/pages/`,
        layouts: `${path_src.html}/layouts/`,
        partials: `${path_src.html}/partials/`,
        helpers: `${path_src.html}/helpers/`,
        data: `${path_src.html}/data/`
      }))
    .pipe(gulp.dest(path_output.prod.html));
});

gulp.task('build', ['html:compile:prod', 'js:concat:prod', 'sass:compile:prod', 'img:copy:prod']);