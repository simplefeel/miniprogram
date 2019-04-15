var gulp = require('gulp'),
    extend = require('extend'),
    del = require('del'),
    replace = require('gulp.replace'),
    less = require('gulp-less'),
    runSequence = require('run-sequence'),
    eslint = require('gulp-eslint'),
    csslint = require('gulp-csslint'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    cleancss = require('gulp-clean-css'),
    ejs = require('gulp-ejs'),
    jsonEditor = require("gulp-json-editor"),
    childProcess = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    config = require('./hap.config');

//项目配置
config = extend(true, {
    src: 'src',
    lib: 'lib',
    build: 'build',
    pages: 'pages',

    //标志环境配置变量，默认为线上环境
    environment: 3,

    //是否是开发环境
    dev: false,

    compress: false,

    mode: 2, //1:组件开发模式，2：项目开发模式

    assets: '*.{png,jpg,gif}',

    ignore: '{bower.json,.bower.json}',

    include: []

}, config);

// 发布时忽略的文件
var publishIgnore = '{app.js,app.json,app.wxss}',
    appJsonFileName = 'app.json';

var CSS_SUFFIX = 'wxss',
    HTML_SUFFIX = 'wxml',
    LEFT_DELIMITER = '$$_',
    RIGHT_DELIMITER = '_$$',
    ORIGIN_CSS_SUFFIX = 'wxss',
    ORIGIN_HTML_SUFFIX = 'wxml';

//工具函数
var util = {
    //获取参数
    getArguments: function(config) {
        return {
            //项目名称
            name: config.name,
            //版本号
            version: config.version,
            //当前环境变量
            environment: config.environment,
            //是否是开发环境
            dev: config.dev,
            //1:组件开发模式，2：项目开发模式
            mode: config.mode
        }
    },

    //决定采用函数运行还是字符串运行
    decideRunFunction: function(arg, config) {
        return typeof arg === 'function' ? arg(this.getArguments(config), config) : arg;
    },

    //获取替换串
    getReplaceString: function(name, leftDelimiter, rightDelimiter) {
        return leftDelimiter && rightDelimiter ? leftDelimiter + name + rightDelimiter : name;
    },

    getRelativePath: function(path, config) {
        var reg = new RegExp(process.cwd() + '/' + config.src + '/(.*)$'),
            matchs = path.match(reg),
            length,
            str = '';

        if (matchs && matchs[1]) {
            length = matchs[1].split('/').length - 1;

            if (!length) {
                str = '.';
            }
            for (var i = 0; i < length; i++) {
                str += '..';

                if (i != length - 1) {
                    str += '/';
                }
            }
        }

        return str;
    },

    getResolvePath: function(file, matchstr, matchpath) {
        var parseResult = path.parse(file.path),
            filepath = path.resolve(parseResult.dir, matchpath);

        if (!path.parse(filepath).ext) {
            filepath += parseResult.ext
        }

        if (fs.existsSync(filepath)) {
            return matchstr;
        } else {
            var str = util.getRelativePath(file.path, config);

            str += '/lib/' + matchpath

            return matchstr.replace(matchpath, str);
        }
    }
};

var flag = false;

//公用模块
var modules = {
    //替换变量
    replace: function(stream, replaceSettings) {
        replaceSettings = replaceSettings || []

        // 非组件开发模式进行替换
        !flag && config.mode !== 1 && replaceSettings.push({
            name: "path",
            value: function(args, file) {
                return function(search, file) {
                    var str = util.getRelativePath(file.path, config);

                    return str || search;
                }
            }
        });

        flag = true;

        replaceSettings && replaceSettings.forEach(function(value) {
            //获取替换字符串
            var replaceString = util.getReplaceString(value.name, LEFT_DELIMITER, RIGHT_DELIMITER);
            //替换变量
            stream = stream.pipe(replace(replaceString, util.decideRunFunction(value.value, config)));
        });

        return stream;
    },

    replaceCssPath: function(stream) {
        var regxp = /@import[^'"]*['"]([^'"]*)['"]/mg;

        if (config.mode !== 1) {
            stream = stream.pipe(replace(regxp, function(file, matchstr, matchpath) {
                return util.getResolvePath.apply(this, arguments)
            }));
        }

        return stream;
    },

    replaceJsPath: function(stream) {
        var regxp = /require[^('"]*\(['"]([^)'"]*)['"]\)/mg;

        if (config.mode !== 1) {
            stream = stream.pipe(replace(regxp, function(file, matchstr, matchpath) {
                return util.getResolvePath.apply(this, arguments)
            }));
        }

        return stream;
    },

    clean: function() {
        del.sync(config.build);
    }
};

//clean
gulp.task('clean', function() {
    del.sync('build');
    del.sync('dist');
});

// copyassets
gulp.task('copyassets', ['copywxhtml', 'copywxss'], function() {
    //如果assets为空，则直接返回
    if (!config.assets) {
        return null;
    }
    var source = [path.join(config.src, '/**/', config.assets), '!' + path.join(config.src, '/**/', config.ignore)],
        stream;

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, '/**/', publishIgnore));

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, config.lib, '/**/*'));

    stream = gulp.src(source);

    return stream.pipe(gulp.dest(config.build));
});

gulp.task('copy', ['copyassets'], function() {
    // 替换 json 变量
    var source = [path.join(config.src, '/**/*.json'), '!' + path.join(config.src, appJsonFileName), '!' + path.join(config.src, '/**/', config.ignore)],
        stream;

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, '/**/', publishIgnore));

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, config.lib, '/**/*'));

    stream = gulp.src(source);

    //替换变量
    stream = modules.replace(stream, config.replace);

    return stream.pipe(gulp.dest(config.build));
});


gulp.task('copywxhtml', function() {
    if (!config.dev && config.mode == 1) {
        return null;
    }
    var source = [path.join(config.src, config.lib, '/**/*.' + HTML_SUFFIX), '!' + path.join(config.src, '/**/', config.ignore)],
        stream;

    stream = gulp.src(source, {
        base: config.src
    });

    //替换变量
    stream = modules.replace(stream, config.replace);

    !config.dev && config.compress && (stream = stream.pipe(htmlmin()));

    return stream.pipe(gulp.dest(config.build));
});

gulp.task('copywxss', function() {
    if (!config.dev && config.mode == 1) {
        return null;
    }
    var source = [path.join(config.src, config.lib, '/**/*.' + CSS_SUFFIX), '!' + path.join(config.src, '/**/', config.ignore)],
        stream;

    stream = gulp.src(source, {
        base: config.src
    });

    //替换变量
    stream = modules.replace(stream, config.replace);

    stream = modules.replaceCssPath(stream);

    !config.dev && config.compress && (stream = stream.pipe(cleancss()));

    return stream.pipe(gulp.dest(config.build));
});

// css
gulp.task('css', function() {
    var source = [path.join(config.src, '/**/*.' + ORIGIN_CSS_SUFFIX), '!' + path.join(config.src, '/**/', config.ignore), '!' + path.join(config.src, config.lib, '/**/*')],
        stream;

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, '/**/', publishIgnore));

    stream = gulp.src(source, {
        base: config.src
    });

    //替换变量
    stream = modules.replace(stream, config.replace);

    stream = modules.replaceCssPath(stream);

    stream = stream.pipe(less()).pipe(rename(function(path) {
        path.extname = "." + CSS_SUFFIX
    }));

    //!config.dev && config.compress && (stream = stream.pipe(cleancss()));

    return stream.pipe(gulp.dest(config.build));
});

// js 任务
gulp.task('js', function() {
    var source = [path.join(config.src, '/**/*.js'), '!' + path.join(config.src, '/**/', config.ignore)],
        stream;

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, '/**/', publishIgnore));

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, config.lib, '/**/*'));

    stream = gulp.src(source);

    //替换变量
    stream = modules.replace(stream, config.replace);

    stream = modules.replaceJsPath(stream);

    //!config.dev && config.compress && (stream = stream.pipe(uglify()));

    return stream.pipe(gulp.dest(config.build));
});

// html 任务
gulp.task('html', function() {
    var source = [path.join(config.src, '/**/*.' + ORIGIN_HTML_SUFFIX), '!' + path.join(config.src, '/**/', config.ignore)],
        stream;

    !config.dev && config.mode == 1 && source.push('!' + path.join(config.src, config.lib, '/**/*'));

    stream = gulp.src(source);

    stream = stream.pipe(ejs());

    //替换变量
    stream = modules.replace(stream, config.replace);

    stream = stream.pipe(rename(function(path) {
        path.extname = "." + HTML_SUFFIX
    }));

    // !config.dev && config.compress && (stream = stream.pipe(htmlmin({
    //     //htmlmin config
    //     collapseWhitespace: true,
    //     removeComments: true,
    //     keepClosingSlash:true
    // })));

    return stream.pipe(gulp.dest(config.build));
});

gulp.task('include', function() {
    if (config.mode == 2) {
        return null;
    }

    var source = [],
        stream;

    config.include.forEach(function(name) {
        source.push(path.join(config.src, config.lib, name, '/**/*'));
    });

    stream = gulp.src(source, {
        base: config.src
    });

    return stream.pipe(gulp.dest(config.build));
});


gulp.task('appjson', function() {
    if (config.mode == 1) {
        return null;
    }

    var source = [path.join(config.src, config.pages, '/**/*.' + ORIGIN_HTML_SUFFIX), path.join(config.src, config.lib, '/**/*.' + ORIGIN_HTML_SUFFIX), '!' + path.join(config.src, '/**/', config.ignore)],
        stream,
        temp = 'mock/temp',
        jsonSource = path.join(config.src, appJsonFileName),
        files = []

    stream = gulp.src(source, {
        base: config.src
    });

    stream = stream.pipe(rename(function(file) {
        if (file.dirname.indexOf(config.pages) !== -1) {

            var filepath = path.join(config.src, file.dirname, file.basename + '.js')

            // 判断文件是否是页面文件
            fs.exists(filepath, function(exists) {

                if (exists) {
                    var text = fs.readFileSync(filepath, 'utf8');
                    /\bPage\(/gm.test(text) && files.push(path.join(file.dirname, file.basename))
                }
            });
        }
    }))

    return stream.pipe(gulp.dest(temp)).on('end', function() {
        del.sync(temp);

        var stream = gulp.src(jsonSource)
            .pipe(jsonEditor(function(json) {
                files = (json.pages || []).concat(files);

                // 数组去重
                json.pages = Array.from(new Set(files));

                return json;
            }))

        //替换变量
        stream = modules.replace(stream, config.replace);

        stream.pipe(gulp.dest(config.build))
    })
});

// eslint
gulp.task('eslint', function() {
    var source = [path.join(config.src, '/**/*.js'), '!' + path.join(config.src, config.lib, '/**/*.js')];
    return gulp.src(source)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
});

// csslint
gulp.task('csslint', ['default'], function() {
    var source = [path.join(config.build, '/**/*.' + ORIGIN_CSS_SUFFIX)];
    return gulp.src(source)
        .pipe(csslint())
        .pipe(csslint.reporter());
});

//server
function startServer() {
    var child = childProcess.spawn('node', ['hap.server']);

    child.on('error', function(e) {
        console.log('server error');
    });
    child.on('exit', function(e) {
        console.log('server exit');
    });
    child.stderr.on('data', function(data) {
        console.log(data.toString());
    });

    process.once('exit', function() {
        console.log('process exit');
        child && child.kill();
    });

    process.once('error', function() {
        console.log('process error');
        child && child.kill();
    });

    console.log('服务启动。地址 http://h5.dev.weidian.com:' + config.port);
}

//watch
gulp.task('watch', ['default'], function(cb) {
    startServer();

    //watch html
    var source = [path.join(config.src, '/**/*.' + ORIGIN_HTML_SUFFIX)];
    gulp.watch(source, function() {
        gulp.start('html');
    });

    //watch css
    source = [path.join(config.src, '/**/*.' + ORIGIN_CSS_SUFFIX)];
    gulp.watch(source, function() {
        gulp.start('css');
    });

    //watch assets
    source = [path.join(config.src, '/**/', String(config.assets)), path.join(config.src, '/**/*.json')];
    gulp.watch(source, function() {
        runSequence('copy', 'appjson');
    });

    //watch js
    source = [path.join(config.src, '/**/*.js')];
    gulp.watch(source, function() {
        gulp.start('js');
    });
});

//default
gulp.task('default', function(cb) {
    var args = [
        'clean', 'copy', 'appjson', ['js', 'css', 'html'], 'include'
    ];

    //删除目录
    modules.clean();

    //回调函数
    args.push(cb);

    runSequence.apply(null, args);
});

//dev 开发环境
gulp.task('dev', function(cb) {
    config.environment = 0;
    config.dev = true;
    runSequence('watch', cb);
});

//dev-daily 开发环境对应测试环境接口
gulp.task('dev-daily', function(cb) {
    config.environment = 1;
    config.dev = true;
    runSequence('watch', cb);
});

//dev-prepare 开发环境对应预发接口
gulp.task('dev-prepare', function(cb) {
    config.environment = 2;
    config.dev = true;
    runSequence('watch', cb);
});

//dev-product 开发环境对应线上接口
gulp.task('dev-product', function(cb) {
    config.environment = 3;
    config.dev = true;
    runSequence('watch', cb);
});

// daily
gulp.task('daily', function(cb) {
    config.environment = 1;
    config.dev = false;
    runSequence('default', cb);
});

// prepare
gulp.task('prepare', function(cb) {
    config.environment = 2;
    config.dev = false;
    runSequence('default', cb);
});

// product
gulp.task('product', function(cb) {
    config.environment = 3;
    config.dev = false;
    runSequence('default', cb);
});

// publish 命令为发布组件
gulp.task('publish', ['eslint'], function(cb) {
    config.environment = 3;
    config.dev = false;
    config.mode = 1;
    config.build = 'dist';
    runSequence('default', cb);
});
