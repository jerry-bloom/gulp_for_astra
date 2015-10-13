var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');


var foreach = require('gulp-foreach');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var cheerio = require('gulp-cheerio');
var runSequence = require('run-sequence');
var fs = require("fs");
var inject = require('gulp-inject-string');
var concat = require('gulp-concat');
//var cssMinify = require('gulp-minify-css');



var DEV_ROOT_DIR = './dev/';
var DEV_DEVJS_DIR = DEV_ROOT_DIR + 'devjs/';
var DEV_JS_DIR = DEV_ROOT_DIR + 'js/';
var DEV_SCSS_DIR = DEV_ROOT_DIR + 'scss/';
var DEV_CSS_DIR = DEV_ROOT_DIR + 'css/';
var DEV_ASSETS_DIR = DEV_ROOT_DIR + 'assets/';

var PREFIX_ROOT_DIR = './prefix/';
var PREFIX_JS_DIR = PREFIX_ROOT_DIR + 'js/';
var PREFIX_CSS_DIR = PREFIX_ROOT_DIR + 'css/';
var PREFIX_ASSETS_DIR = PREFIX_ROOT_DIR + 'assets/';

var PREPROD_DIR = './preprod/';
var PROD_DIR = './prod/';


var Project = {
    prefix: "ugg_fall15",
    jspPath: "${baseUrlAssets}/dyn_img/cat_splash/",
    exclude:{
            protected_id_class: ["BrightcoveExperience",
                                "myExperience4065945907001",
                                "fa",
                                "fa-chevron-up",
                                "fa-chevron-down",
                                "fa-angle-up",
                                "fa-angle-down",
                                "fa-twitter",
                                "fa-pinterest-p",
                                "fa-facebook",
                                "lazy"
                                ]
            }
    };

// 'background-image':'url(' + '../"+ assetsServer + "/dyn_img/cat_splash/spfall15_index0_out.png' + ')'  in js file


gulp.task('webserver', function() {
    connect.server({
        livereload: true
    });
});



gulp.task('compile-scss', function () {
    return gulp.src(Project.prefix+'.scss', {cwd:DEV_SCSS_DIR})
        .pipe(sass().on('error', sass.logError))
//        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError));
        .pipe(gulp.dest(DEV_CSS_DIR));
});

gulp.task('compiledevlib-js', function() {
    return gulp.src([DEV_DEVJS_DIR+'fastclick.js',
        DEV_DEVJS_DIR+'jquery.address-1.6.min.js',
        DEV_DEVJS_DIR+'jquery.lazyload.js',
        DEV_DEVJS_DIR+'TweenMax.min.js'])
        .pipe(concat(Project.prefix+'_lib.js'))
        .pipe(gulp.dest(DEV_DEVJS_DIR));
});

gulp.task('compiledev-js', function() {
    return gulp.src([DEV_DEVJS_DIR+Project.prefix+'_lib.js',
        DEV_DEVJS_DIR+Project.prefix+'.js'])
        .pipe(concat(Project.prefix+'.js'))
        .pipe(gulp.dest(DEV_JS_DIR));
});



gulp.task('watch', function() {
    gulp.watch('dev/assets/*.*', ['watch-assets']);
    gulp.watch('dev/devjs/*.js', ['watch-js']);
    gulp.watch('dev/*.html', ['watch-html']);
    gulp.watch('dev/scss/*.scss', ['watch-scss']);
});
gulp.task('watch-assets', function(){
    runSequence('prefix-assets','preprod-assets');
});
gulp.task('watch-js', function(){
    runSequence('compiledevlib-js','compiledev-js','prefix-js','compileprefix-js','preprod-js');
});

gulp.task('watch-html', function(){
    runSequence('prefix-html','preprod-css1','preprod-css2','preprod-html');
});
gulp.task('watch-scss', function(){
    runSequence('compile-scss','prefix-css','preprod-css1','preprod-css2','preprod-html');
});

gulp.task('watch-htmlscss', function(){
    runSequence('prefix-html','compile-scss','prefix-css','preprod-css1','preprod-css2','preprod-html');
});

gulp.task('livereload', function() {
    gulp.src(['dev/css/*.css','dev/js/*.js'])
        .pipe(watch(['dev/css/*.css','dev/js/*.js','dev/*.html']))
        .pipe(connect.reload());
});



gulp.task('default', ['start']);

gulp.task('start', function(){
    runSequence('watch-assets', 'watch-js', 'watch-htmlscss', 'webserver', 'livereload', 'watch');
});
















//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================
//=====================PREFIX======================



gulp.task('prefix-assets', function () {
    return gulp.src(["*.*"], {cwd:DEV_ASSETS_DIR})
        //.pipe(vinylPaths(del)) //delete current folder
        .pipe(foreach(function(stream, imagefiles){
            if (imagefiles.path.split('/').pop().indexOf(Project.prefix) === -1 ) {
                return stream.pipe(rename({
                    dirname: "/",
                    prefix: Project.prefix + '_'
                }));
            } else {
                console.log('Assets already prefixed');
                return stream;
            }
        }))
        .pipe(gulp.dest(PREFIX_ASSETS_DIR));
});






gulp.task('prefix-css', function() {
    return gulp.src('*.css', {cwd:DEV_CSS_DIR})

        // reset
        .pipe(replace(Project.prefix + '_', ''))

        // classes and ids
        .pipe(replace(/(\.)-?[_a-zA-Z]+[_a-zA-Z0-9-:]*(\s|{)/g, function(fullmatch) { return '.' + Project.prefix + '_' + fullmatch.slice(1); }))
        .pipe(replace(/(\#)-?[_a-zA-Z]+[_a-zA-Z0-9-:]*(\s|{)/g, function(fullmatch) { return '#' + Project.prefix + '_' + fullmatch.slice(1); }))

        // assets path
        .pipe(replace(new RegExp('../assets/', 'g'), '../assets/' + Project.prefix + '_'))

        .pipe(gulp.dest(PREFIX_CSS_DIR));

});






gulp.task('prefix-js', function () {
    return gulp.src(Project.prefix+'.js', {cwd:DEV_DEVJS_DIR}) 
        // reset
        .pipe(replace(Project.prefix + '_', ''))


        // prefix classes and ids and assets
        
        //for more than one jquery selects
        .pipe(replace(/(\,)(?:\s*|)(\#|\.)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))

        .pipe(replace(/(?:\$\()(?:\s*|)(?:\"|\')(\#|\.)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))
        .pipe(replace(/(?:find\()(?:\s*|)(?:\"|\')(\#|\.)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))
        .pipe(replace(/(?:next\()(?:\s*|)(?:\"|\')(\#|\.)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))
        .pipe(replace(/(?:previous\()(?:\s*|)(?:\"|\')(\#|\.)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))
        .pipe(replace(/(?:remove\()(?:\s*|)(?:\"|\')(\#|\.)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))


        .pipe(replace(/(?:addClass\()(?:\s*|)(?:\"|\')/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))
        .pipe(replace(/(?:removeClass\()(?:\s*|)(?:\"|\')/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))
        .pipe(replace("assets/'", "assets/" + Project.prefix + '_'))

        // imagepath
        .pipe(replace(new RegExp('assets/', 'g'), 'assets/' + Project.prefix + '_'))

        .pipe(gulp.dest(PREFIX_JS_DIR));
});

gulp.task('compileprefix-js', function() {
    return gulp.src( [DEV_DEVJS_DIR+Project.prefix+'_lib.js',
        PREFIX_JS_DIR+Project.prefix+'.js'] )
        //.pipe(uglify())
        .pipe(concat(Project.prefix+'.js'))
        .pipe(gulp.dest(PREFIX_JS_DIR));
});






gulp.task('prefix-html', function () {
    return gulp.src('index.html', {cwd:DEV_ROOT_DIR})
        .pipe(replace(Project.prefix + '_', ''))

        // id css
        .pipe(cheerio({
            run: function ($, gulp_file_object) {
                $("*").each(function (i, element) {
                    prefix_HTML_ID_CLASS( $(element), Project.prefix);
                });
            },
            parserOptions: {
                xmlMode: false
            }
        }))
        // image paths
        .pipe(replace(/(?:\"|\')(?:assets\/)/g, function(fullmatch,group0) { return fullmatch + Project.prefix + '_'; }))


        .pipe(gulp.dest(PREFIX_ROOT_DIR));
});


function prefix_HTML_ID_CLASS ($element, prefix_name) {
    if ('undefined' !== typeof $element.attr("id")) {
        $element.attr("id", prefix_array(prefix_name, $element.attr("id")));
    }
    if ('undefined' !== typeof $element.attr("class")) {
        $element.attr("class", prefix_array(prefix_name, $element.attr("class")));
    }
};

function prefix_array(prefix_name, string_name) {
    var new_string_name = '';
    classarray = string_name.split(' ');
    if (classarray.length > 0 && classarray !== "undefined") {
        //if there are more than one, each string will be prefixed as well
        classarray = classarray.map(function (old_string_name) {

            if (Project.exclude.protected_id_class.indexOf(old_string_name) === -1) {
                return prefix_name + '_' + old_string_name;
            }else{
                return old_string_name;
            }
        });
        new_string_name = classarray.join(' ');
    }
    return new_string_name;
};










//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================
//=====================PREPROD======================






/*
gulp.task('preprod-empty', function () {
    return gulp.src(PREPROD_DIR+'/*.*')
        .pipe(vinylPaths(del));
});
*/


gulp.task('preprod-assets', function () {
    return gulp.src(["*.*"], {cwd:PREFIX_ASSETS_DIR})
        .pipe(rename({
            dirname: "/"
        }))
        .pipe(gulp.dest(PREPROD_DIR));
});



gulp.task('preprod-js', function () {
    return gulp.src('*.js', {cwd:PREFIX_JS_DIR})
        // path inside js file update
        .pipe(replace(new RegExp('assets/', 'g'), ''))
        .pipe(gulp.dest(PREPROD_DIR));
});



gulp.task('preprod-css1', function () {
    return gulp.src(["*.css"], {cwd:PREFIX_CSS_DIR})
        .pipe(rename({
            dirname: "/"
        }))
        .pipe(gulp.dest(PREPROD_DIR));
});




gulp.task('preprod-css2', function () {
    //separate background image from css to html
    //create css file without background image in preprod folder
    var cssFile = fs.readFileSync(PREFIX_CSS_DIR+Project.prefix+'.css', "utf8");
    var splitCSSOBJ = splitCSS(cssFile);
    fs.writeFile(PREPROD_DIR + Project.prefix + '.css', splitCSSOBJ.CSSOBJ);

    //create html file with background image in preprod folder
    return gulp.src('index.html', {cwd:PREFIX_ROOT_DIR})
        .pipe(inject.after('<style>', '\n'+splitCSSOBJ.HTMLOBJ+'\n'))
        .pipe(gulp.dest(PREPROD_DIR));
});
function splitCSS (cssFile) {
    var cssarray = cssFile.split('}');
    var HTMLstyle = [], CSSstyle = [];
    cssarray.forEach(function (csschunk) {
        //if it contains an image
        if (csschunk.indexOf('.jpg') > -1 || csschunk.indexOf('.png') > -1 || csschunk.indexOf('.gif') > -1) {
            HTMLstyle.push(csschunk);
            HTMLstyle.push('}');
        } else if (csschunk) {// if its not empty
            CSSstyle.push(csschunk);
            CSSstyle.push('}');
        }
    });
    return { CSSOBJ : CSSstyle.join('') , HTMLOBJ : HTMLstyle.join('') };
};




gulp.task('preprod-html', function () {
    return gulp.src('*.html', {cwd:PREPROD_DIR})
        .pipe(replace(new RegExp('../assets/'+Project.prefix, 'g'), ''+Project.prefix))
        .pipe(replace(new RegExp('assets/'+Project.prefix, 'g'), ''+Project.prefix))
        //.pipe(replace(new RegExp('js/'+Project.prefix, 'g'), ''+Project.prefix))
        .pipe(replace(/(?:src)(?:\s*|)(\=)(?:\s*|)(?:\"|\'|)(js\/)/g, function(fullmatch,group0) { return fullmatch.slice(0, -3); }))
//        .pipe(replace(new RegExp('css/'+Project.prefix, 'g'), ''+Project.prefix))
        .pipe(replace(/(?:href)(?:\s*|)(\=)(?:\s*|)(?:\"|\'|)(css\/)/g, function(fullmatch,group0) { return fullmatch.slice(0, -4); }))        
        .pipe(gulp.dest(PREPROD_DIR));
});







//=====================PROD======================
//=====================PROD======================
//=====================PROD======================
//=====================PROD======================
//=====================PROD======================
//=====================PROD======================
//=====================PROD======================
//=====================PROD======================
//=====================PROD======================



gulp.task('prod-empty', function () {
    return gulp.src(PROD_DIR+'/*.*')
        .pipe(vinylPaths(del));
});

gulp.task('prod-assets', function () {
    return gulp.src(["*.*"], {cwd:PREPROD_DIR})
        .pipe(gulp.dest(PROD_DIR));
});

//change $ to $b in js file
gulp.task('prod-jquerydollarb', function () {
    return gulp.src(["*.js"], {cwd:PROD_DIR})
        .pipe(replace(/(\$\()/g, function(fullmatch,group0) { return '$b('; }))
        .pipe(gulp.dest(PROD_DIR));
});


//task replaced by adding var creative_baseUrlAssets in js files
/*
gulp.task('prod-js', function(){
    return gulp.src(PREFIX_JS_DIR + Project.prefix + '.js')
        .pipe(replace(new RegExp('assets/', 'g'), '"+ assetsServer + "/dyn_img/cat_splash/'))
        .pipe(gulp.dest(PROD_DIR));
});
*/






gulp.task('prod-jsp', function(){
    return gulp.src(PREPROD_DIR+'index.html')
        .pipe(replace(/(?:url)(?:\s*|)(\()(?:\s*|)(?:\"|\'|)/g, function(fullmatch) { return fullmatch + Project.jspPath ; }))        
        // .pipe(replace( 'url("' + Project.prefix, 'url("' + Project.jspPath + Project.prefix ))
        // .pipe(replace( "url('" + Project.prefix, "url('" + Project.jspPath + Project.prefix ))
        // .pipe(replace( 'url(' + Project.prefix, 'url(' + Project.jspPath + Project.prefix ))

        .pipe(replace(new RegExp("href[^a-zA-Z0-9_]*"+Project.prefix, 'g'), function(fullmatch) { return fullmatch.slice(0, -1*Project.prefix.length) + Project.jspPath + Project.prefix; }))        

        .pipe(replace(/(?:data-original)(?:\s*|)(=)(?:\s*|)(?:\"|\'|)/g, function(fullmatch,group0) { return fullmatch + Project.jspPath ; }))        
        // .pipe(replace( 'data-original="' + Project.prefix, 'data-original="' + Project.jspPath + Project.prefix ))
        // .pipe(replace( "data-original='" + Project.prefix, "data-original='" + Project.jspPath + Project.prefix ))
        // .pipe(replace( 'data-original=' + Project.prefix, 'data-original=' + Project.jspPath + Project.prefix ))

        .pipe(replace(new RegExp("src[^a-zA-Z0-9_]*"+Project.prefix, 'g'), function(fullmatch) { return fullmatch.slice(0, -1*Project.prefix.length) + Project.jspPath + Project.prefix; }))        

        .pipe( cheerio( function($, file) {
            var prodIndex = $('body').html();
            // prodIndex = removeQuotes(prodIndex.split("src="));
            // prodIndex = prodIndex.join("src=");
            // prodIndex = removeQuotes(prodIndex.split("href="));
            // prodIndex = prodIndex.join("href=");
            fs.writeFile(PROD_DIR + Project.prefix + '.jsp', prodIndex);
        }));
});



gulp.task('prod-customCSS', function() {
    return gulp.src([DEV_SCSS_DIR+'custom.css',
        PROD_DIR+Project.prefix+'.css'])
        .pipe(concat(Project.prefix+'.css'))
        .pipe(gulp.dest(PROD_DIR));
});



gulp.task('prod', function(){
    runSequence('prod-empty', 'prod-assets', 'prod-customCSS', 'prod-jsp');
//    runSequence('prod-empty', 'prod-assets','prod-jquerydollarb', 'prod-jsp');
//    runSequence('prod-empty', 'prod-assets', 'prod-js', 'prod-jsp');
});

// add auto disable border color for debugging
// minify js for final version
// minify sass for final version





