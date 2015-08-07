/*global module:false*/
module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  var files = require('./files').files;

  // Project configuration.
  grunt.initConfig({
    builddir: 'build',
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/**\n' +
        ' * <%= pkg.description %>\n' +
        ' * @version v<%= pkg.version %>\n' +
        ' * @link <%= pkg.homepage %>\n' +
        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
        ' */'
    },
    clean: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
    concat: {
      options: {
        banner: '<%= meta.banner %>\n\n'+
                '/* commonjs package manager support (eg componentjs) */\n'+
                'if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){\n'+
                '  module.exports = \'angular-m\';\n'+
                '}\n\n'+
                '(function (window, angular, undefined) {\n',
        footer: '})(window, window.angular);'
      },
      build: {
        src: files.src,
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>\n'
      },
      build: {
        files: {
          '<%= pkg.name %>.min.js': ['<banner:meta.banner>', '<%= concat.build.dest %>']
        }
      }
    },
    release: {
      options: {
        npm: false,
        tag: false,
        pushTags: false,
        additionalFiles: ['bower.json'],
        beforeRelease: ['build'],
        github: {
          accessTokenVar: 'ANGULARMGITAUTH',
          repo: 'dlhdesign/angular-m'
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/*.js', '<%= pkg.name %>.js'],
      options: {
        eqnull: true
      }
    },
    watch: {
      files: ['src/*.js', 'test/**/*.js'],
      tasks: ['build', 'karma:background:run']
    },
    connect: {
      server: {},
      sample: {
        options:{
          port: 4444,
          keepalive: true
        }
      }
    },
    karma: {
      options: {
        configFile: 'config/karma.js',
        singleRun: true,
        exclude: [],
        frameworks: ['jasmine'],
        reporters: 'dots',
        port: 4445,
        colors: true,
        autoWatch: false,
        autoWatchInterval: 0,
        browsers: [ grunt.option('browser') || 'PhantomJS' ]
      },
      unit: {
        browsers: [ grunt.option('browser') || 'PhantomJS' ]
      },
      debug: {
        singleRun: false,
        background: false,
        browsers: [ grunt.option('browser') || 'Chrome' ]
      },
      background: {
          background: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
      },
      watch: {
        configFile: 'config/karma.js',
        singleRun: false,
        autoWatch: true,
        autoWatchInterval: 1
      }
    },
    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    },
    ngdocs: {
      options: {
        dest: 'site',
        styles: [ 'ngdoc_assets/angularM-docs.css' ],
        html5Mode: false,
        title: 'Angular-m',
        startPage: '/api/angular.m'
      },
      api: {
        src: ['src/**/*.js'],
        title: 'API Reference'
      }
    }
  });

  grunt.registerTask('build', 'Perform a normal build', ['env', 'clean', 'concat', 'uglify']);
  grunt.registerTask('default', 'Run dev server and watch for changes', ['build', 'connect:server', 'watch']);

  // Helpers for custom tasks, mainly around promises / exec
  var exec = require('faithful-exec'), shjs = require('shelljs');

  function system(cmd) {
    grunt.log.write('% ' + cmd + '\n');
    return exec(cmd).then(function (result) {
      grunt.log.write(result.stderr + result.stdout);
    }, function (error) {
      grunt.log.write(error.stderr + '\n');
      throw 'Failed to run \'' + cmd + '\'';
    });
  }

  function promising(task, promise) {
    var done = task.async();
    promise.then(function () {
      done();
    }, function (error) {
      grunt.log.write(error + '\n');
      done(false);
    });
  }

  function ensureCleanMaster() {
    return exec('git symbolic-ref HEAD').then(function (result) {
      if (result.stdout.trim() !== 'refs/heads/master') throw 'Not on master branch, aborting';
      return exec('git status --porcelain');
    }).then(function (result) {
      if (result.stdout.trim() !== '') throw 'Working copy is dirty, aborting';
    });
  }
};