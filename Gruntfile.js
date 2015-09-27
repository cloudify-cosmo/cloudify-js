/* jshint node:true */
'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var bannerTxt = grunt.file.read('banner.txt');


    // Project configuration.
    grunt.initConfig({
        reportsBase: process.env.REPORTS_BASE || 'reports',
        distDir: 'dist',
        destDir: '<%= distDir %>',
        year: new Date().getFullYear(),
        jsdoc: {
            dist: {
                src: ['src/lib/**/*.js', 'README.md'],
                options: {
                    destination: 'doc'
                }
            }
        },
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
        aws_s3: {
            options: {
                accessKeyId: '<%= aws.accessKey %>', // Use the variables
                secretAccessKey: '<%= aws.secretKey %>', // You can also use env variables
                uploadConcurrency: 5, // 5 simultaneous uploads
                downloadConcurrency: 5, // 5 simultaneous downloads
                access: 'public-read',
                bucket: '<%= aws.bucket %>'
            },
            upload: {
                files: [
                    {dest: '', cwd: 'doc', action: 'upload', src: ['**'], expand: true}
                ]
            }
        },
        connect: { // grunt connect:server:keepalive
            server: {
                options: {
                    port: 9001,
                    base: '.',
                    middleware: function (connect) {
                        return [
                            connect.static('./test/example'),
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
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    timeout: 20000
                },
                src: ['test/backend/client.node.spec.js']
            }
        },
        karma: {
            debug: {
                configFile: 'karma.angular.conf.js',
                singleRun:false,
                junitReporter: { outputFile: '<%= reportsBase %>/debug-test-result.xml' }
            },
            unit: {
                configFile: 'karma.vanilla.conf.js',
                singleRun: true,
                junitReporter: { outputFile: '<%= reportsBase %>/unit-test-result.xml' }
            },
            vanilla: {
                configFile: 'karma.vanilla.conf.js',
                singleRun: true,
                junitReporter: { outputFile: '<%= reportsBase %>/vanilla-test-result.xml' }
            },
            jquery: {
                configFile: 'karma.jquery.conf.js',
                singleRun: true,
                junitReporter: { outputFile: '<%= reportsBase %>/jquery-test-result.xml' }
            },
            angular: {
                configFile: 'karma.angular.conf.js',
                singleRun: true,
                junitReporter: { outputFile: '<%= reportsBase %>/angular-test-result.xml' }
            }
        }
    });

    grunt.registerTask('readAwsKeys', function(){
        grunt.config.data.aws = grunt.file.readJSON(process.env.AWS_CONFIG || './dev/aws.json');
    });

    grunt.registerTask('upload', [ 'readAwsKeys', 'aws_s3:upload']);


    grunt.registerTask('test', [
        'karma',
        'mochaTest'
    ]);



    grunt.registerTask('build', [
        'jshint',
        'browserify',
        'uglify'
    ]);


    grunt.registerTask('default', [
        'jshint',
        'browserify',
        //'test',
        'build'
    ]);
};