module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src  : 'src/js/<%= pkg.name %>.js',
                dest : 'build/js/<%= pkg.name %>.min.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};

//
///*global module:false*/
//module.exports = function(grunt) {
//  'use strict';
//
//  var _  = grunt.util._ ;
//  var config = require('./require.config');
//  config.shim = { app:[] };
//
//  for (var i in config.config.app.dataStash){
//    config.shim.app.push(config.config.app.dataStash[i]);
//  }
//
//  // Project configuration.
//  grunt.initConfig({
//    // Metadata.
//    pkg: grunt.file.readJSON('package.json'),
//    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
//      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
//      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
//      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
//      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
//
//    uglify: {
//      prod: {
//        options:{
//          mangle:true,
//          compress:true,
//          report:'false'
//        },
//        files: {
//          'web/build/scripts/reader.min.js' : ['web/build/scripts/reader.build.js']
//        }
//      },
//      dev: {
//          options:{
//              mangle:false,
//              compress:false,
//              report:'false',
//              beautify: true
//          },
//          files: {
//              'web/build/scripts/reader.js' : ['web/build/scripts/reader.build.js']
//          }
//      }
//    },
//    react: {
//      app: {
//        options: {
//          extenstion:'js',
//          ignoreMTime: false
//        },
//        files: {
//          'web/source/js/reader/compiled-templates':'web/source/js/reader/templates' // destination:source
//        }
//      }
//    },
//
//    requirejs: {
//      app:{
//        options: _.merge(config, {
//          findNestedDependencies:true,
//          optimize: "none",
//          baseUrl:  "web/source/js",
//          name:     "mainApp",
//          mainConfigFile: "require.config.js",
//          out:      "web/build/scripts/reader.build.js"
//        })
//      }
//    },
//    // TODO: Enable more of these and clean up results
//    jshint: {
//      options: {
//        curly:    true,
//        devel:    true,
//        eqeqeq:   true,
//        eqnull:   true,
//        immed:    true,
//        latedef:  true,
//        //maxdepth: 4,
//        newcap:   true,
//        noarg:    true,
//        noempty:  true,
//        sub:      true,
//        trailing: true,
//        undef:    false,
//
//        boss:    true,
//        browser: true,
//        jquery:  true
//
//        //camelcase: true,
//        //es3:      true,
//        //forin:    true,
//        //indent:   4,
//        //maxcomplexity: 20,
//        //strict:   true,
//        //unused:  true,
//      },
//      gruntfile: {
//        src: 'Gruntfile.js'
//      },
//      src: ['web/source/js/lire/**/*.js','web/source/reader/**/*.js']
//    },
//
//    copy: {
//      main: {
//        files: [
//            // Copy all images
//            // TODO: use grunt-contrib-imagemin
//            {
//              expand: true,
//              cwd: 'web/source/img/',
//              src:  '**',
//              dest: 'web/build/img/'
//            },
//            // Copy js libs
//            {
//                expand: true,
//                cwd: 'web/source/js/libs',
//                src:  '**',
//                dest: 'web/build/scripts/'
//            },
//            // fonts
//            {
//                expand: true,
//                cwd: 'web/source/style/font-awesome',
//                src:  'font/**',
//                dot: true,
//                dest: 'web/build/style/'
//            },
//            // config
//            {
//                expand: true,
//                cwd: 'web/config',
//                src:  '*',
//                dest: 'web/build/config/'
//            },
//            // stub data
//            {
//                expand: true,
//                cwd: 'web/source/js/',
//                src:  '*.json',
//                dest: 'web/build/scripts/'
//            },
//            // Raw CSS
//            {
//                expand: true,
//                cwd: 'web/source/style/',
//                src:  '**/*.css',
//                dest: 'web/build/style/'
//            }
//        ]
//      }
//    },
//
//    sass: {
//      dist: {
//        files: [{
//          expand: true,
//          cwd: 'web/source/style',
//          src: ['style.scss'],
//          dest: 'web/build/style',
//          ext: '.css'
//        }]
//      }
//    },
//
//    qunit: {
//      files: ['test/**/*.html']
//    },
//
//    watch: {
//      gruntfile: {
//        files: '<%= jshint.gruntfile.src %>',
//        tasks: ['jshint:gruntfile']
//      },
//      sass: {
//        files: 'web/source/style/**/*.scss',
//        tasks: ['sass']
//      },
//      jshint: {
//          files: 'web/source/js/**/*.js',
//          tasks: ['jshint']
//      },
//      require: {
//        files: 'web/source/js/**/*.js',
//        tasks: ['react','requirejs']
//      },
//      uglify: {
//          files: 'web/build/scripts/reader.build.js',
//          tasks: ['uglify:dev']
//      },
//      copy: {
//        files: ['web/source/js/libs/*',
//                'web/config/*',
//                'web/source/js/*.json',
//                'web/source/style/**/*.css'],
//        tasks: ['copy']
//      }
//    }
//  });
//
//  // These plugins provide necessary tasks.
//  grunt.loadNpmTasks('grunt-contrib-requirejs');
//  grunt.loadNpmTasks('grunt-contrib-concat');
//  grunt.loadNpmTasks('grunt-contrib-uglify');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-watch');
//  grunt.loadNpmTasks('grunt-contrib-copy');
//  grunt.loadNpmTasks('grunt-contrib-sass');
//  grunt.loadNpmTasks('grunt-react');
//
//
//  //specific tasks
//  grunt.registerTask('default',  ['react', 'jshint', 'requirejs', 'uglify:dev',  'copy', 'sass']);
//  grunt.registerTask('dev',      ['react', 'jshint', 'requirejs', 'uglify:dev',  'copy', 'sass']);
//  grunt.registerTask('prod',     ['react', 'jshint', 'requirejs', 'uglify:prod', 'copy', 'sass']);
//  grunt.registerTask('template', ['react', 'requirejs', 'uglify:prod']);
//};
