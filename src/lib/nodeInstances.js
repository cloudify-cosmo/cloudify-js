'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');

/**
 * @typedef {object} NodeInstancesClient~NodeInstance
 * @property {string} id the identifier of the node instance
 * @property {string} node_id the identifier of the node whom this is the instance of.
 * @property {object} relationships the node instance relationships
 * @property {string} host_id the node instance host_id
 * @property {string} deployment_id the deployment id the node instance belongs to
 * @property {object} runtime_properties the runtime properties of the node instance
 * @property {string} state the current state of the node instance
 * @property {number} version the current version of the node instance - used for optimistic locking on update)
 */

/**
 * @description
 * collection of API calls for node instances
 * @class NodeInstancesClient
 * @param {ClientConfig} config
 * @constructor
 */
function NodeInstancesClient( config ){
    this.config = config;
}

/**
 * @description
 * returns the node instance for the provided node instance id.
 * @param {string} node_instance_id the identifier of the node instance to get
 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets the retrieved node instance
 */
NodeInstancesClient.prototype.get = function( node_instance_id, _include, callback ){
    logger.trace('getting node instances');
    if ( !node_instance_id ){
        callback( new Error('node_instance_id is missing'));
        return;
    }

    var qs = {};

    if ( _include ){
        qs._include = _include;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint + '/node-instances/{0}', node_instance_id),
            'qs': qs
        },
        callback
    );
};

/**
 * @description
 * update node instance with the provided state & runtime_properties
 *
 * @param {string} node_instance_id the identifier of the node instance to update
 * @param {string|null} [state] the updated state
 * @param {object|null} [runtime_properties=null] the updated runtime properties
 * @param {number} [version=0] current version value of this node instance in cloudify's storage (used for optimistic locking)
 * @param {ApiCallback} callback body gets the updated node instance
 */
NodeInstancesClient.prototype.update = function( node_instance_id, state, runtime_properties, version , callback ){
    logger.trace('updating node instance');
    if ( !node_instance_id ){
        callback(new Error('node_instance_id is missing'));
    }

    if ( isNaN(parseInt(version))){
        version = 0;
    }

    var body = {
        'version' : version
    };

    if ( runtime_properties ){
        body.runtime_properties = runtime_properties;
    }

    if ( state ){
        body.state = state;
    }

    return this.config.request(
        {
            'method' : 'PATCH',
            'url' : String.format( this.config.endpoint + '/node-instances/{0}', node_instance_id ),
            'json'  : true,
            'body' : body
        },
        callback
    );
};


/**
 * @description
 * returns a list of node instances which belong to the deployment identified by the provided deployment id.
 * @param {string|null} [deployment_id=null] deployment id to list node instances for.
 * @param {string|null} [node_name=null] node id to only fetch node instances with this name.
 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets list of node instances
 */
NodeInstancesClient.prototype.list = function( deployment_id, _include , callback ){
    logger.trace('listing node instances');
    var qs = {};

    if ( deployment_id ){
        qs.deployment_id = deployment_id;
    }

    if (_include){
        qs._include = _include;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/node-instances',
            'qs' : qs
        },
        callback
    );
};


module.exports = NodeInstancesClient;