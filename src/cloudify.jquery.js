'use strict';

var Client = require('./lib/client');
var request = require('browser-request');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern:'[ %d ] [ %c ] :: %m'
            }
        }
    ]
});
var logger = log4js.getLogger('cloudify.angular');

/**
 * @param {ClientConfig} config
 */
$.CloudifyClient = function (config) {
    if (!config.request) {
        config.request = request;
    }
    return new Client(config);
};

logger.trace('cloudifyjs is ready for use');