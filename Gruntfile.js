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
                src: [ 'src/**/*.js', 'Gruntfile.js']
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
        browserify:{
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
                    '<%= distDir %>/cloudify.jquery.js' : ['src/cloudify.jquery.js']
                }
            },
            vanilla_client: {
                files: {
                    '<%= distDir %>/cloudify.vanilla.js' : ['src/cloudify.vanilla.js' ]
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
        }
    });


    grunt.registerTask('test', [

    ]);

    grunt.registerTask('build',[
        'jshint',
        'browserify',
        'uglify'
    ]);



    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};