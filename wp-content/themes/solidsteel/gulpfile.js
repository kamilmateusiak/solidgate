/* requirements => */
require( 'es6-promise' ).polyfill();
/* <= requirements */

/* variables => */
var autoprefixer = require( 'gulp-autoprefixer' ),
    browserSync = require( 'browser-sync' ).create(),
    concat = require( 'gulp-concat' ),
    concatCss = require( 'gulp-concat-css' ),
    gulp = require( 'gulp' ),
    //gulpDeployFtp = require( 'gulp-deploy-ftp' ), // => todo - zainstalowac
    gutil = require( 'gulp-util' ),
    imagemin = require( 'gulp-imagemin' ),
    jshint = require( 'gulp-jshint' ), //nie jest uzywane
    plumber = require( 'gulp-plumber' ),
    pngquant = require( 'gulp-pngquant' ),
    pump = require( 'pump' ),
    reload = browserSync.reload,
    rename = require( 'gulp-rename' ),
    sass = require( 'gulp-sass' ),
    uglify = require( 'gulp-uglify' ),
    uglifycss = require( 'gulp-uglifycss' ),
    /* project => */
    /*
    gulpDeployFtpOptions = {
      user : username, //or 'username' ???
      password : password,
      port : ftp server port,
      host : ftp server host,
      uploadPath : target path
    }
    */
    projectFolder = 'solidgate',
    proxy = 'http://localhost/solidgate/',
    cssFilesToConcat =
    [
      '../'+projectFolder+'/css/bootstrap.min.css',
      '../'+projectFolder+'/css/editor-style.css',
      '../'+projectFolder+'/style.css',
      '../'+projectFolder+'/css/importStyles.css'
    ],
    jsFilesToConcat =
    [
      '../../../wp-includes/js/jquery/jquery.js',
      '../../../wp-includes/js/jquery/jquery-migrate.min.js',
      '../../../wp-includes/js/wp-embed.min.js',
      '../'+projectFolder+'/js/vendors/*.js'
    ];
    /* <= project */
/* <= variables */

/* onError => */
var onError = function( err ){
  console.log( '!ERROR:', gutil.colors.yellow( err.message ) );
  gutil.beep();
  this.emit( 'end' );
};
/* <= onError */

/* deployftp => */
/*
gulp.task( 'deployftp', function(){
  gulp.src( 'path/to/file' )
    .pipe( gulpDeployFtp( options ) )
    .pipe( gulp.dest( 'dest' ) );
});
*/
/* <= gulpDeployFtpOptions */

/* deployftp => */
gulp.task( 'compressJs', function( cb ){
  pump([
      gulp.src( '../'+projectFolder+'/js/vendors/*.js' ),
      uglify(),
      gulp.dest( '../'+projectFolder+'/js' )
    ],
    cb
  );
});
/* <= compressjs */

/* compresscss => */
gulp.task( 'compressCss', function(){
  gulp.src( '../'+projectFolder+'/**/*.css' )
    .pipe( uglifycss({
      "maxLineLen" : 100000,
      "uglyComments" : true
    }))
    .pipe( gulp.dest( '../'+projectFolder+'' ) );
});
/* <= compresscss */

/* images => */
/* korzystajac z KRAKENA jest to niepotrzebne */
gulp.task( 'images', function(){
  return gulp.src( '../'+projectFolder+'/images/extra-images/**' )
    .pipe( imagemin({
      progressive : true,
      svgoPlugins : [ { removeViewBox : false } ],
      use : [ pngquant() ]
    }))
    .pipe( gulp.dest( '../'+projectFolder+'/images' ) )
});
/* <= images */

/* js => laczenie i kompresja plikow js-owych */
gulp.task( 'concatJs', function(){
  return gulp.src( jsFilesToConcat )
    .pipe( plumber( { errorHandler : onError } ) )
    .pipe( concat( 'scripts.js' ) )
    .pipe( rename( { suffix : '.min' } ) )
    .pipe( gulp.dest( '../'+projectFolder+'/js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( '../'+projectFolder+'/js' ) )
});
/* <= js */

/* css => laczenie i kompresja plikow css-owych */
gulp.task( 'concatCss', function(){
  return gulp.src( cssFilesToConcat )
    .pipe( plumber( { errorHandler : onError } ) )
    //.pipe( concat( 'all_styles.css' ) )
    .pipe( concatCss( "styles.css" ) )
    .pipe( rename( { suffix : '.min' } ) )
    .pipe( gulp.dest( '../'+projectFolder+'/css' ) )
    .pipe( uglifycss({
      "maxLineLen" : 500000,
      "uglyComments" : true
    }))
    .pipe( gulp.dest( '../'+projectFolder+'/css' ) )
});
/* <= css */

/* sass => */
gulp.task( 'sass', function(){
  return gulp.src( '../'+projectFolder+'/dev-css/style.sass' )
    .pipe( plumber( { errorHandler : onError } ) )
    .pipe( sass( { outputStyle : 'compressed' } ) )
    .pipe( autoprefixer( { browsers : [ 'Firefox 14', 'IE 8', 'IE 9', 'last 5 versions', 'Opera 11.1' ], cascade : false } ) )
    .pipe( gulp.dest( '../'+projectFolder+'' ) );
});
/* <= sass*/

/* watch => */
gulp.task( 'watch', function(){
  browserSync.init({
    files : [ '../'+projectFolder+'/**/*.php', '../'+projectFolder+'/**/*.sass', '../'+projectFolder+'/js/*.js' ],
    proxy : proxy
  });
  gulp.watch( '../'+projectFolder+'/dev-css/**/*.sass', [ 'sass' ] );
  gulp.watch( '../'+projectFolder+'/js/vendors/*.js', [ 'concatJs' ] );
  //gulp.watch( '../'+projectFolder+'/images/extra-images/**', [ 'images' ] );
  gulp.watch( '../'+projectFolder+'/**/*.css', [ 'concatCss' ] );
});
/* <= watch */

/* default => */

gulp.task( 'default', [ 'sass', 'concatJs', 'concatCss', 'watch' ] );

/* <= default */
