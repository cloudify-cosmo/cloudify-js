/* jshint node:true */
'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var bannerTxt = grunt.file.read('banner.txt');


    // Project configuration.
    grunt.initConfig({
        distDir: 'dist',
        destDir: '<%= distDir %>',
        year: new Date().getFullYear(),
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            main: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js', 'Gruntfile.js']
            },
            backendJasmineTest: {
                options: {
                    jshintrc: 'test/backend/.jshintrc'
                },
                files: {
                    src: [
                        'test/backend/**/*.js'
                    ]
                }
            }
        },
        uglify: {
            angular_client: {
                files: {
                    '<%= destDir %>/cloudify.angular.min.js': ['<%= distDir %>/cloudify.angular.js']
                }
            },
            jquery_client: {
                files: {
                    '<%= destDir %>/cloudify.jquery.min.js': ['<%= distDir %>/cloudify.jquery.js']
                }
            },
            vanilla_client: {
                files: {
                    '<%= destDir %>/cloudify.vanilla.min.js': ['<%= distDir %>/cloudify.vanilla.js']
                }
            }
        },
        browserify: {
            options: {
                banner: bannerTxt
            },
            angular_client: {
                files: {
                    '<%= distDir %>/cloudify.angular.js': ['src/cloudify.angular.js']
                }
            },
            jquery_client: {
                files: {
                    '<%= distDir %>/cloudify.jquery.js': ['src/cloudify.jquery.js']
                }
            },
            vanilla_client: {
                files: {
                    '<%= distDir %>/cloudify.vanilla.js': ['src/cloudify.vanilla.js']
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: '.',
                    middleware: function (connect) {
                        return [
                            connect.static('./test/manual'),
                            connect.static('./dist')
                        ];
                    }
                }
            }
        },
        // Configure a mochaTest task
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/backend/client.node.spec.js']
            }
        },
        karma: {
            debug: {
                configFile: 'karma.vanilla.conf.js',
                singleRun:false
            },
            unit: {
                configFile: 'karma.vanilla.conf.js',
                singleRun: true
            },
            vanilla: {
                configFile: 'karma.vanilla.conf.js',
                singleRun: true
            },
            jquery: {
                configFile: 'karma.jquery.conf.js',
                singleRun: true
            },
            angular: {
                configFile: 'karma.angular.conf.js',
                singleRun: true
            }
        }
    });


    grunt.registerTask('test', [
        'jshint',
        'browserify',
        'karma:jquery'
    ]);

    grunt.registerTask('build', [
        'jshint',
        'browserify',
        'uglify'
    ]);


    grunt.registerTask('default', [
        'jshint',
        //'test',
        'build'
    ]);
};