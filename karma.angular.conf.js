'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
            '3rd-parties/angularjs/angular.js',
            '3rd-parties/angular-mocks/angular-mocks.js',
            //'3rd-parties/angular-sanitize/angular-sanitize.js',
            //'3rd-parties/angular-resource/angular-resource.js',
            'node_modules/expect.js/index.js',
            'dist/cloudify.angular.js',
            'test/backend/client.angular.spec.js'

        ],

        exclude: [],

        preprocessors: {
            'test/backend/client.angular.spec.js': ['browserify']
        },

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: false,

        browsers: ['Chrome'],

        browserify: {
            debug: true,
            transform: []
        },

        plugins: [
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine', 'karma-browserify'],

        singleRun: false
    };

    config.set(configuration);
};