module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

//        jshint: {
//            options: {
//                curly:    true,
//                devel:    true,
//                eqeqeq:   true,
//                eqnull:   true,
//                immed:    true,
//                latedef:  true,
//                newcap:   true,
//                noarg:    true,
//                noempty:  true,
//                sub:      true,
//                trailing: true,
//                undef:    false,
//                boss:    true,
//                browser: true,
//                jquery:  true
//            },
//            gruntfile: {
//                src: 'Gruntfile.js'
//            },
//            src: ['src/js/**/*.js']
//        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle:true,
                compress:true,
                report:'false'
            },
            build: {
                expand : true,           // Enable dynamic expansion.
                cwd    : 'src/',         // Src matches are relative to this path.
                src    : ['js/**/*.js'], // Actual pattern(s) to match.
                dest   : 'build/',       // Destination path prefix.
                ext    : '.min.js'       // Dest filepaths will have this extension.
            }
        },

        copy: {
            main: {
                files: [
                    // Non-compressed Javascript (dev build)
                    {
                        expand: true,
                        cwd  : 'src/',
                        src  :  ['js/**/*.js'],
                        dest : 'build/'
                    },
                    // Libraries
                    {
                        expand: true,
                        cwd  : 'src/',
                        src  :  ['lib/**/*'],
                        dest : 'build/'
                    },
                    // Images
                    {
                        expand: true,
                        cwd  : 'src/',
                        src  :  ['img/**/*'],
                        dest : 'build/'
                    },
                    // Fonts
                    {
                        expand: true,
                        cwd  : 'src/',
                        src  :  ['fonts/**/*'],
                        dest : 'build/'
                    }
                ]
            }
        },

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

        jst: {
            compile: {
                options: {
                    templateSettings: {
                        interpolate : /\{\{(.+?)\}\}/g
                    }
                },
                files: {
                    "build/js/gui/templates/GuiTemplate.js": ["src/js/gui/templates/**/*.jhtml"]
                }
            },
            options: {
                namespace : "GuiTemplate",
                amd       : true,
                prettify  : true,
                processName: function(filepath) {
                    var parts = filepath.split("/");
                    return parts[parts.length -1].replace(".jhtml", "");
                }
            }
        },

        watch: {
//            gruntfile: {
//                files: '<%= jshint.gruntfile.src %>',
//                tasks: ['jshint:gruntfile']
//            },
            sass: {
                files: 'src/css/**/*.scss',
                tasks: ['sass']
            },
//            jshint: {
//                files: 'src/js/**/*.js',
//                tasks: ['jshint']
//            },
            uglify: {
                files: 'src/js/**/*.js',
                tasks: ['uglify']
            },
            jst: {
                files: 'src/js/gui/templates/**/*.jhtml',
                tasks: ['jst']
            },
            copy: {
                files: ['src/js/**/*.js',
                        'src/js/libs/**/*',
                        'src/img/**/*',
                        'src/fonts/**/*'],
                tasks: ['copy']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jst');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'copy', 'sass', 'jst']);
};
