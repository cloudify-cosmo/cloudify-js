'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');

/**
 * @typedef {object} Node
 * @property {string} id the identifier of the node
 * @property {string} deployment_id the deployment id the node instance belongs to
 * @property {???} properties the static properties of the node
 * @property {object} operations the node operations mapped to plugins
 * @property {[]} relationships the node instance relationships
 * @property {string} blueprint_id the id of the blueprint this node belongs to.
 * @property {object} plugins the plug
 * @property {number} number_of_instances the umber of instances this node has
 * @property {number} deploy_number_of_instances the number of instances set for this node when the deployment was created
 * @property {string} host_id the id of the node instance which hosts this node
 * @property {[]} type_hierarchy the type hierarchy of this node
 * @property {string} type the type of this node
 */

/**
 * @description
 * collection of API calls for node
 * @class NodesClient
 * @param {ClientConfig} config
 * @constructor
 */
function NodesClient( config ){
    this.config = config;
}


/**
 * @description
 * returns a list of nodes which belongs to the deployment identified by the provided deployment id.
 * @param {string|null} [deployment_id=null] the deployment's id to list nodes for.
 * @param {string|null} [node_id=null] response will filter nodes by this id.
 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets list of nodes
 */
NodesClient.prototype.list = function( deployment_id, node_id, _include , callback ){
    logger.trace('listing nodes');
    var qs = {};

    if ( deployment_id ){
        qs.deployment_id = deployment_id;
    }

    if ( node_id ){
        qs.node_id = node_id;
    }

    this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/nodes',
            qs: qs
        },
        callback
    );
};

/**
 * @description
 * returns the node which belongs to the deployment identified by the provided deployment id.
 * @param {string} deployment_id the deployment's id of the node.
 * @param {string} node_id the node id
 * @param {IncludeParam|null} [_include=null]
 * @param {ApiCallback} callback body gets list of nodes
 */
NodesClient.prototype.get = function( deployment_id, node_id, _include, callback ){
    logger.trace('getting nodes');
    if ( !deployment_id ){
        callback( new Error('deployment_id is missing'));
        return;
    }

    if ( !node_id ){
        callback( new Error('node_id is missing'));
        return;
    }

    this.list( deployment_id, node_id, _include, function( err, response, body ){
            if ( !!body && body.length > 0 ){
                body = body[0];
            }
            callback(err, response, body);
        }
    );
};

module.exports = NodesClient;
