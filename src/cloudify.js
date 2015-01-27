'use strict';

var request =require('request');

var Client = require('./lib/client');

var logger = require('log4js').getLogger('cloudify');

module.exports = function(config){
    if ( !config.request){
        config.request = request;
    }
    return new Client(config);
};

logger.trace('client is ready');