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
const babel = require("gulp-babel");
const gwcn = require('gulp-wxa-copy-npm');
const sourcemaps = require('gulp-sourcemaps');
const minimist = require('minimist');

const knownOptions = {}
const args = minimist(process.argv.slice(2), knownOptions)
const env = args.env || "dev"

const name = process.env.npm_package_name;
const version = process.env.npm_package_version;
const versionCode = process.env.npm_package_versionCode;
const build = process.env.npm_package_build;

const production = process.env.NODE_ENV === 'production'

/**
 * lint 流程
 */
gulp.task('eslint', () => {
  return gulp.src(['./src/**/*.js'])
    // .pipe($.eslint())
    // .pipe($.eslint.format())
    // .pipe($.eslint.failAfterError())
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
    //.pipe($.if(production, $.jsonminify()))
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
    // .pipe($.if(production, $.htmlmin({
    //   collapseWhitespace: true,
    //   removeComments: true,
    //   keepClosingSlash: true
    // })))
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
gulp.task('scripts', () => {
  return gulp.src(['./src/**/*.js'])
    .pipe($.babel())
    .pipe(gwcn(args))
    .pipe(replace('FMT_VERSION_CODE', versionCode))
    .pipe(replace('FMT_BUILD', build))
    .pipe(replace('FMT_ENV', '"' + env + '"'))
    .pipe(replace('FMT_NAME', '"' + name + '"'))
    .pipe(replace('FMT_VERSION', '"' + version + '"'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('scripts:watch', () => {
  gulp.watch(['./src/**/*.js'], ['scripts'])
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
