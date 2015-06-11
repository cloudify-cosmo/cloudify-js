'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'mocha'],

        files: [
            'dist/cloudify.vanilla.js',
            'test/backend/client.vanilla.spec.js'

        ],

        exclude: [],
        proxies:{
            '/cloudify-api' : 'http://10.10.1.10'
        },
        preprocessors: {
            'test/backend/client.vanilla.spec.js': ['browserify']
        },

        reporters: ['junit','spec','failed'],

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
            'karma-spec-reporter',
            'karma-failed-reporter',
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-browserify'
        ],

        singleRun: false
    };

    config.set(configuration);
};