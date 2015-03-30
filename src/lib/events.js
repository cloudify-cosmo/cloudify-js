'use strict';

var logger = require('log4js').getLogger('cloudify.events');

/**
 * @description
 * collection of API calls for events
 * @class EventsClient
 * @param {ClientConfig} config
 * @constructor
 */
function EventsClient( config ){
    this.config = config;
}

EventsClient._create_events_query = function (execution_id, include_logs) {
    var query = {
        'bool': {
            'must': [
                {'match': {'context.execution_id': execution_id}},
            ]
        }
    };
    var match_cloudify_event = {'match': {'type': 'cloudify_event'}};
    var match_cloudify_log = null;

    if (include_logs) {
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
 * @description
 * returns event for the provided execution id
 * @param {string} execution_id - id of execution to get events for
 * @param {number} [from_event=0] index of first event to retrieve on pagination
 * @param {number} [batch_size=100] maximum number of events to retrieve per call
 * @param {boolean} [include_logs=false] whether to also get logs
 * @param {ApiCallback} callback body gets events list and total number of currently available events.
 */
EventsClient.prototype.get = function( execution_id, from_event, batch_size, include_logs , callback ){
    logger.trace('getting events');

    var qs = {
        'sort' : [ {'@timestamp' : { 'order' : 'asc'} } ],
        'query' : EventsClient._create_events_query( execution_id, include_logs )
    };

    if ( !isNaN(parseInt(from_event,10)) ){
        qs.from = from_event;
    }else{
        qs.from = 0;
    }

    if ( !isNaN(parseInt(batch_size), 10 ) ){
        qs.size = batch_size;
    }else{
        qs.size = 100;
    }

    this.query( qs , callback );
};

/**
 * @description
 * same as get, but only gets a query object instead of constructing the query himself.
 *
 */
EventsClient.prototype.query = function( query , callback ){
    logger.trace('getting events');

    this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/events',
            'json':true,
            'body': query

        },
        function( err, response, body ){

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
