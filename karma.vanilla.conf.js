'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
            'node_modules/expect.js/index.js',
            'dist/cloudify.vanilla.js',
            'test/backend/client.vanilla.spec.js'

        ],

        exclude: [],

        preprocessors: {
            'test/backend/client.vanilla.spec.js': ['browserify']
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