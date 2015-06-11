'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'mocha'],

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

        proxies:{
          '/cloudify-api' : 'http://10.10.1.10'
        },
        preprocessors: {
            'test/backend/client.angular.spec.js': ['browserify']
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
            'karma-phantomjs-launcher',
            'karma-spec-reporter',
            'karma-failed-reporter',
            'karma-junit-reporter',
            'karma-mocha',
            'karma-browserify'],

        singleRun: false
    };

    config.set(configuration);
};