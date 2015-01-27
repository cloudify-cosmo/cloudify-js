'use strict';

var Client = require('./lib/client');
var request = require('browser-request');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type:'console' }
    ],
    replaceConsole: true
});
var logger = log4js.getLogger('cloudify.angular');


window.CloudifyClient = function(config){

    if ( !config.request ){
        config.request = request;
    }
    return new Client(config);

};

logger.trace('cloudifyjs is ready for use');