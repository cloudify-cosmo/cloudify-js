'use strict';
module.exports = function(config) {
    var configuration = {

        basePath: '',

        frameworks: ['browserify', 'mocha'],

        files: [
            'test/phantomjs.shim.js',
            'dist/cloudify.vanilla.js',
            'test/backend/client.vanilla.spec.js'

        ],

        exclude: [],
        proxies:{
            '/cloudify-api' : process.env.CLIENT_ENDPOINT || 'http://localhost/api/v2'
        },
        preprocessors: {
            'test/backend/client.vanilla.spec.js': ['browserify']
        },

        reporters: ['junit','spec','failed'],
        timeout: 40000,

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