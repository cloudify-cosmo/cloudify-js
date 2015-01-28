'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');

/**
 * @typedef EvaluatedFunc
 * @property {string} deployment_id
 * @property {object} payload
 */

/**
 * @description
 * collection of API calls for remote execution
 * @class EvaluateClient
 * @param {ClientConfig} config
 * @constructor
 */
function EvaluateClient( config ){
    this.config = config;
}

/**
 * @description evaluate intrinsic functions in payload in respect tohe provided context
 * @param {string} deployment_id the deployment's id of the node
 * @param {object} context the processing context
 * @param {string} [context.self]
 * @param {string} [context.source]
 * @param {string} [context.target]
 * @param {object} payload the payload to process
 *
 * @param {ApiCallback} callback body gets the payload with its intrinsic functions references evaluated.
 */
EvaluateClient.prototype.functions = function( deployment_id, context, payload, callback ){
    logger.trace('evaluating');
    this.config.request(
        {
            'method' : 'POST',
            'url' : '/evaluate/functions',
            'json' : true,
            'body' : {
                'deployment_id' : deployment_id,
                'context' : context,
                'payload' : payload
            }
        },
        callback
    );
};

module.exports = EvaluateClient;
