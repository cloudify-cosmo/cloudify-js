'use strict';
var logger = require('log4js').getLogger('cloudify.events');

/**
 * @description
 * collection of API calls for events
 * @class EventsClient
 * @param options - request options
 * @param callback
 * @constructor
 */
function EventsClient( config ){
    this.config = config;
}

EventsClient.prototype.get = function(options, callback){
    logger.trace('getting logs and events');
    return this.config.request( {
        'method' : 'GET',
        'json': true,
        'url' : this.config.endpoint + '/events',
        'qs' : options
    }, callback );
};

module.exports = EventsClient;
