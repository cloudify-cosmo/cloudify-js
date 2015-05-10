'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
            'node_modules/expect.js/index.js',
            '3rd-parties/jquery/dist/jquery.js',
            'dist/cloudify.jquery.js',
            'test/backend/client.jquery.spec.js'

        ],

        exclude: [],

        preprocessors: {
            'test/backend/client.jquery.spec.js': ['browserify']
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