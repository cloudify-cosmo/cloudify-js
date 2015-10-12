'use strict';


var logger = require('log4js').getLogger('cloudify.events');

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
    var i;

    if ( !opts ){
        opts = {};
    }

    var query = {
        'query': {
            'bool': {
                'must': [],
                'should': []
            }
        }
    };

    if(!!opts.from){
        query.from = opts.from;
    }

    if(!!opts.size){
        query.size = opts.size;
    }

    if(!!opts.sort){
        query.sort = [];
        var sortObj = {},
            sortField = opts.sort.field,
            sortOrder = opts.sort.order;
        sortObj[sortField] = { order : sortOrder};
        query.sort.push(sortObj);
    }

    if(!!opts.searches){
        for( i = 0; i<opts.searches.length;i++){
            if(opts.searches[i].predicate){
                if(opts.searches[i].matchAny){
                    var mustArray = query.query.bool.must;
                    mustArray.push({'terms': {}});
                    mustArray[mustArray.length -1].terms[opts.searches[i].predicate] = opts.searches[i].matchAny;
                }
                if(opts.searches[i].gte){

                }
                if(opts.searches[i].lte){

                }
            }
        }
    }

    if ( !!opts.execution_id ){
        query.query.bool.must.push({'match': {'context.execution_id': opts.execution_id}});
    }

    if ( !!opts.deployment_id ){
        query.query.bool.must.push({'match': {'context.deployment_id': opts.deployment_id}});
    }
    if ( !!opts.execution_ids ){
        for( i=0; i>opts.execution_ids.length;i++)
        {
            query.query.bool.must.push({'match': {'context.execution_id': opts.execution_ids[i]}});
        }
    }

    if ( !!opts.deployment_ids ){
        for( i=0; i>opts.deployment_ids.length;i++)
        {
            query.query.bool.must.push({'match': {'context.deployment_id': opts.deployment_ids[i]}});
        }
    }

    var match_cloudify_event = {'match': {'type': 'cloudify_event'}};
    var match_cloudify_log = null;

    if (opts.include_logs) {
        match_cloudify_log = {'match': {'type': 'cloudify_log'}};

        query.query.bool.should = [
            match_cloudify_event, match_cloudify_log
        ];
    } else {
        query.query.bool.must.push(match_cloudify_event);
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

    if (typeof(opts) === 'function' ){ // backward compatibility
        callback = opts;
        opts = {};
    }

    return EventsClient.query.apply(this,[EventsClient._create_events_query( opts ), callback]);
};

/**
 * @description
 * same as get, but only gets a query object instead of constructing the query himself.
 *
 */
EventsClient.query = function( query , callback ){
    logger.trace('getting events');

    if ( !callback ){
        callback = function(){};
    }

    return this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/events',
            'json':true,

            // we recommend the following algorithm to know if you need Content-Type: application/json
            // if json: true ==> set header Content-Type application/json.
            // you should not rely on overriding the header as the github issue below specified so.

            // https://github.com/iriscouch/browser-request/issues/54

            //'headers' : { // https://cloudifysource.atlassian.net/browse/CFY-2996
            //    'Content-Type' : 'application/json'
            //},
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
