const Builder = require('gulp-bem-bundle-builder');
const bundler = require('gulp-bem-bundler-fs');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssUrl = require('postcss-url');
const autoprefixer = require('autoprefixer');
const debug = require('gulp-debug');
const csso = require('gulp-csso');
const filter = require('through2-filter');
const merge = require('merge2');
const concat = require('gulp-concat');
const stylus = require('gulp-stylus');
const uglify = require('gulp-uglify');
const bemhtml = require('gulp-bem-xjst').bemhtml;
const toHtml = require('gulp-bem-xjst').toHtml;

const builder = Builder({
    levels: [
        'libs/bem-core/common.blocks',
        'libs/bem-core/desktop.blocks',
        'libs/bem-components/common.blocks',
        'libs/bem-components/desktop.blocks',
        'libs/bem-components/design/common.blocks',
        'libs/bem-components/design/desktop.blocks',
        'common.blocks',
        'desktop.blocks'
    ],
    techMap: {
        bemhtml: ['bemhtml.js'],
        js: ['vanilla.js', 'browser.js', 'js'],
        css: ['styl', 'css']
    }
});

gulp.task('build', () => {
    return bundler('desktop.bundles/index')
        .pipe(builder({
            css: bundle =>
                bundle.src('css')
                    .pipe(stylus())
                    .pipe(postcss([
                        autoprefixer({
                            browsers: ['ie >= 10', 'last 2 versions', 'opera 12.1', '> 2%']
                        }),
                        postcssUrl({ url: 'inline' })
                    ]))
                    .pipe(csso())
                    .pipe(concat(bundle.name + '.min.css')),
            js: bundle =>
                merge(
                    gulp.src(require.resolve('ym')),
                    bundle.src('js')
                        .pipe(filter.obj(file => file.tech !== 'bemhtml.js'))
                )
                    .pipe(uglify())
                    .pipe(concat(bundle.name + '.min.js')),
            html: bundle => {
                var bemHtmlStream = bundle.src('bemhtml')
                    .pipe(concat('server.bemhtml.js'))
                    .pipe(bemhtml());
                return gulp.src('*.bundles/*/*.bemjson.js')
                    .pipe(toHtml(bemHtmlStream));
            }
       }))
       .on('error', console.error)
       .pipe(debug())
       .pipe(gulp.dest('./desktop.bundles/index'))
       .on('error', console.error);
});
