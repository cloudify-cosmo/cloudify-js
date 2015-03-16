'use strict';

var logger = require('log4js').getLogger('deployments');
/**
 * @typedef {object} Deployment
 *
 * @property {array}    inputs              Parameters injected into the blueprint upon deployment creation
 * @property {string}   blueprint_id        The identifier of the blueprint
 * @property {object}   policy_types        Policies provide a way of analyzing a stream of events that correspond to a group of nodes
 * @property {object}   outputs             Outputs provide a way of exposing global aspects of a deployment
 * @property {string}   created_at          Timestamp of deployment creation
 * @property {string}   updated_at          Timestamp of deployment last update
 * @property {string}   id                  The identifier of the deployment
 * @property {object}   groups              Groups provide a way of configuring shared behavior for different sets of node templates
 * @property {array}    workflows           Set of tasks that can be executed on a node or a group of nodes
 * @property {array}    policy_triggers     Actions implementations invoked by policies
 */

/**
 * @description
 * collection of API calls for deployments
 * @class Deployments
 * @param {ClientConfig} config
 * @constructor
 */
function Deployments( config ){
    this.config = config;
}

/**
 * @param {string} _include list of fields to include in response
 * @param {ApiCallback} callback
 * @returns {Array<Deployments>} a list of currently stored deployments.
 */
Deployments.prototype.list = function( _include, callback ){
    logger.trace('listing deployments');
    var qs = {};
    if ( !!_include ){
        qs._include = _include;
    }
    return this.config.request( {
        'method' : 'GET',
        'url' : this.config.endpoint + '/deployments',
        'qs' : qs
    }, callback );
};

module.exports = Deployments;