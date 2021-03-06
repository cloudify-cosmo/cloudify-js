'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'mocha'],

        files: [
            'test/phantomjs.shim.js',
            '3rd-parties/angularjs/angular.js',
            '3rd-parties/angular-mocks/angular-mocks.js',
            //'3rd-parties/angular-sanitize/angular-sanitize.js',
            //'3rd-parties/angular-resource/angular-resource.js',
            'dist/cloudify.angular.js',
            'test/backend/client.angular.spec.js'

        ],

        exclude: [],

        proxies:{
          '/cloudify-api' : process.env.CLIENT_ENDPOINT || 'http://localhost/api/v2.1'
        },
        preprocessors: {
            'test/backend/client.angular.spec.js': ['browserify']
        },

        reporters: ['junit','spec','failed'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: false,

        browsers: [process.env.TEST_BROWSER || 'Chrome'],

        customLaunchers: {
            PhantomJS_noSecurity: {
                base: 'PhantomJS',
                flags: [
                    '--web-security=false',
                    '--ignore-ssl-errors=true'
                ]
            }
        },

        browserify: {
            debug: true,
            transform: []
        },

        browserNoActivityTimeout : 60000, //default 10000
        timeout: 40000,

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