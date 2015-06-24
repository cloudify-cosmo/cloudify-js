'use strict';


var logger = require('log4js').getLogger('cloudify.events');
var _ = require('lodash');

/**
 * @description
 * collection of API calls for events
 * @class EventsClient
 * @param {ClientConfig} config
 * @param {GetOpts} opts
 * @constructor
 */
function EventsClient( config ){
    this.config = config;
}

EventsClient._create_events_query = function ( opts ) {

    if ( !opts ){
        opts = {};
    }

    var query = {
        'bool': {
            'must': [

            ]
        }
    };


    if ( !!opts.execution_id ){
        query.bool.must.push({'match': {'context.execution_id': opts.execution_id}});
    }

    if ( !!opts.deployment_id ){
        query.bool.must.push({'match': {'context.deployment_id': opts.deployment_id}});
    }


    var match_cloudify_event = {'match': {'type': 'cloudify_event'}};
    var match_cloudify_log = null;

    if (opts.include_logs) {
        match_cloudify_log = {'match': {'type': 'cloudify_log'}};

        query.bool.should = [
            match_cloudify_event, match_cloudify_log
        ];
    } else {
        query.bool.must.push(match_cloudify_event);
    }

    return query;
};

/**
 * @typedef {object} GetOpts
 * @property {string} deployment_id - filter by deployment
 * @property {string} execution_id - filter by execution_id
 * @property {array} sort -  default is `[ {'@timestamp' : { 'order' : 'asc'} } ]`
 * @property {string} [order=asc] - default is `asc`
 * @property {boolean} [include_logs=false] - yes iff logs should be included. by default only events are included.
 * @property {number} [from_event=0]  index of first event to retrieve on pagination
 * @property {number} [batch_size=100] maximum number of events to retrieve per call
 */

/**
 * @description
 * returns event for the provided execution id
 * @param {GetOpts} opts
 * @param {ApiCallback} callback body gets events list and total number of currently available events.
 */
EventsClient.prototype.get = function( opts, callback ){
    logger.trace('getting events');

    // initialize order defaults
    opts = _.merge({
        order: 'asc',
        include_logs: false,
        from_event: 0,
        batch_size:100

    }, opts);

    // initialize rest of defaults. had to initialize order first in order to use it here.
    opts = _.merge({
        sort: [ {'@timestamp' : { 'order' : opts.order } } ]
    }, opts);



    if (typeof(opts) === 'function' ){ // backward compatibility
        callback = opts;
        opts = {};
    }



    var qs = {
        'sort' : opts.sort,
        'query' : EventsClient._create_events_query( opts )
    };

    if ( !isNaN(parseInt(opts.from_event,10)) ){
        qs.from = opts.from_event;
    }else{
        qs.from = 0;
    }

    if ( !isNaN(parseInt(opts.batch_size), 10 ) ){
        qs.size = opts.batch_size;
    }else{
        qs.size = 100;
    }

    return this.query( qs , callback );
};

/**
 * @description
 * same as get, but only gets a query object instead of constructing the query himself.
 *
 */
EventsClient.prototype.query = function( query , callback ){
    logger.trace('getting events');

    if ( !callback ){
        callback = function(){};
    }

    return this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/events',
            'json':true,
            'headers' : { // https://cloudifysource.atlassian.net/browse/CFY-2996
                'Content-Type' : 'application/json'
            },
            'body': query

        },
        function( err, response/*, body*/ ){

            if ( !!response && !!response.body ){
                response.body = {
                    'total_events' :  response.body.hits.total,
                    'events' : response.body.hits.hits
                };
            }
            callback(err, response, response.body);
        } );
};


module.exports = EventsClient;
