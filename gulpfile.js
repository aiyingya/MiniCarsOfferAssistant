/***
 * davidfu 2017年3月15日
 *
 * 项目结构目录重新定义
 *
 * /
 * src/           项目源码所在地
 * build/         打包脚本目录，此前放在根目录的 webpack.config.js 应该放在此
 * dist/          打包产物目录，此前放在根目录的 index.html 和 /n-build 都应该放在此
 *    小程序基本目录
 * node_modules/  npm 生成的依赖包
 *
 */

const gulp = require('gulp')
const del = require('del')
const runSequence = require('run-sequence')
const $ = require('gulp-load-plugins')()
const replace = require('gulp-replace');



let env = process.env.NODE_ENV || process.env.npm_package_config_env || "prd";
var myConfig = {
  apiUrl:{}
};

myConfig.apiUrl.webapi = require('./src/config/config.json')[env] ;
myConfig.env = env || process.env.npm_package_config_env || "prd";
myConfig.versionCode = process.env.npm_package_config_versionCode;
myConfig.version = process.env.npm_package_config_version;
myConfig.build = process.env.npm_package_config_build;




let prod = false

/**
 * lint 流程
 */
gulp.task('eslint', () => {
  return gulp.src(['./src/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
})

gulp.task('jsonlint', () => {
  return gulp.src(['./src/**/*.json'])
    .pipe($.jsonlint())
    .pipe($.jsonlint.reporter())
    .pipe($.jsonlint.failAfterError())
})

/**
 * json 文件处理
 */
gulp.task('json', ['jsonlint'], () => {
  return gulp.src('./src/**/*.json')
    .pipe($.if(prod, $.jsonminify()))
    .pipe(gulp.dest('./dist'))
})

gulp.task('json:watch', () => {
  gulp.watch('./src/**/*.json', ['json'])
})

/**
 * 图片资源文件处理
 */
gulp.task('assets', () => {
  return gulp.src('./src/images/**')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('assets:watch', () => {
  gulp.watch('./src/images/**', ['assets'])
})

/**
 * wxml 文件处理
 */
gulp.task('templates', () => {
  return gulp.src('./src/**/*.wxml')
    .pipe($.if(prod, $.htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      keepClosingSlash: true
    })))
    .pipe(gulp.dest('./dist'))
})

gulp.task('templates:watch', () => {
  gulp.watch('./src/**/*.wxml', ['templates'])
})

/**
 * wxss 文件处理
 */
gulp.task('styles', () => {
  return gulp.src(['./src/**/*.wxss', '!./src/styles/**'])
    .pipe(gulp.dest('./dist'))
})

gulp.task('styles:watch', () => {
  gulp.watch('./src/**/*.wxss', ['styles'])
})

/**
 * js 文件处理
 */
gulp.task('scripts', ['eslint'], () => {
  gulp.src(['./src/**/global.js'])
  //开始替换
    .pipe(replace('来啊互相伤害', JSON.stringify(myConfig)))
    .pipe(gulp.dest('./dist'));

  return gulp.src(['./src/**/*.js','!./src/global.js'])
    // .pipe($.sourcemaps.init())
    .pipe($.babel())
    // .pipe($.if(prod, $.uglify()))
    // .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('scripts:watch', () => {
  gulp.watch('./src/**/*.js', ['scripts'])
})

/**
 * 清空 dist 目录
 */
gulp.task('clean', () => {
  return del(['./dist/**'])
})

/**
 * 任务定义
 */
gulp.task('build', [
  'json',
  'assets',
  'templates',
  'styles',
  'scripts'
])

gulp.task('watch', [
  'json:watch',
  'assets:watch',
  'templates:watch',
  'styles:watch',
  'scripts:watch'
])

gulp.task('build:clean', (callback) => {
  runSequence('clean', 'build', callback)
})

gulp.task('watch:clean', (callback) => {
  runSequence('build:clean', 'watch', callback);
})

gulp.task('default', ['watch:clean'])
