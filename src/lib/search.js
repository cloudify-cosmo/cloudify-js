'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');

/**
 * @description
 * collection of API calls for searching
 * @class SearchClient
 * @param {ClientConfig} config
 * @constructor
 */
function SearchClient( config ){
    this.config = config;
}

/**
 * @description run the provided elasticsearch query
 * @param {string} query elasticsearch query
 * @param {ApiCallback} callback body gets result hits
 */
SearchClient.prototype.run_query = function( query, callback ){
    logger.trace('running query');
    this.config.request(
        {
            'method' : 'POST',
            'json': true,
            'url' : this.config.endpoint + '/search',
            'body' : query
        },
        callback
    );
};

module.exports = SearchClient;
