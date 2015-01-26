/* jshint node:true */
'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var bannerTxt = grunt.file.read('banner.txt');


    // Project configuration.
    grunt.initConfig({
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
        }
    });


    grunt.registerTask('test', [

    ]);

    grunt.registerTask('build',[

    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};