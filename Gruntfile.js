/**
 * Grunt Configuration
 *
 * @param grunt
 */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Babel Task
     */
    babel: {
      dist: {
        options: {
          sourceMap: true,
          presets: ['es2015']
        },
        files: [
          {
            "expand": true,
            "cwd": "src",
            //"src": ["js/**/*.js"],
            "src": ["jsemu/config/**/*.js", "runner.js"],
            "dest": "build/",
            "ext": ".js"
          }
        ]
      }
    },

    /**
     * Copy Task
     */
    copy: {
      main: {
        files: [
          // Libraries
          {
            expand: true,
            cwd: 'src/',
            src: ['lib/**/*'],
            dest: 'build/'
          },
          // Images
          {
            expand: true,
            cwd: 'src/',
            src: ['img/**/*'],
            dest: 'build/'
          },
          // Fonts
          {
            expand: true,
            cwd: 'src/',
            src: ['fonts/**/*'],
            dest: 'build/'
          }
        ]
      }
    },

    /**
     * Sass Task
     */
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['css/**/style.scss'],
          dest: 'build/',
          ext: '.css'
        }]
      }
    },

    /**
     * JST Task
     */
    jst: {
      compile: {
        options: {},
        files: {
          "build/jsemu/gui/templates/GuiTemplate.js": ["src/jsemu/gui/templates/**/*.jhtml"]
        }
      },
      options: {
        namespace: "GuiTemplate",
        amd: true,
        prettify: true,
        processName: function (filepath) {
          var parts = filepath.split("/");
          return parts[parts.length - 1].replace(".jhtml", "");
        }
      }
    },

    /**
     * Watcher Task
     */
    watch: {
      babel: {
        files: [
          'src/runner.js',
          'src/jsemu/**/*.js'
        ],
        tasks: ['babel']
      },
      sass: {
        files: 'src/css/**/*.scss',
        tasks: ['sass']
      },
      jst: {
        files: 'src/jsemu/gui/templates/**/*.jhtml',
        tasks: ['jst']
      },
      copy: {
        files: [
          'src/libs/**/*',
          'src/img/**/*',
          'src/fonts/**/*'
        ],
        tasks: ['copy']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-babel');


  // Default task(s).
  grunt.registerTask('default', ['babel', 'copy', 'sass', 'jst']);
};
