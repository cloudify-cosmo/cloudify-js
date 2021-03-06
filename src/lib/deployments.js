'use strict';

var logger = require('log4js').getLogger('cloudify.deployments');

/**
 * @typedef {object} DeploymentsClient~Inputs
 */

/**
 * @typedef {object} DeploymentsClient~Outputs
 */

/**
 * @typedef {object} DeploymentsClient~Deployment
 * @property {string} id the identifier of the deployment
 * @property {string} blueprint_id the identifier of the blueprint this deployment elongs to.
 * @property {Array<Workflow>} the workflows of this deployment.
 * @property {Inputs} The inputs provided on deployment creation
 * @property {Outputs} The outputs definition of this deployment
 *
 */

/**
 * @typedef {object} DeploymentsClient~Workflow
 * @property {string} id the workflow's id
 * @property {string} name the workflow's name
 * @property {object} parameters the workflows parameters
 */

/**
 * @typedef {object} DeploymentOutputsClient~DeploymentOutputs
 * @property {string} deployment_id
 * @property {object} outputs
 */


/**
 * @class DeploymentOutputsClient
 * @description
 * handles rest api calls specific for deployment outputs
 * @constructor
 */
function DeploymentOutputsClient( config ){
    this.config = config;
}

/**
 *
 * @description
 * gets the outputs for the provided deployment's id.
 * @param {string} deployment_id
 * @param {ApiCallback} callback the body gets the outputs.
 */
DeploymentOutputsClient.prototype.get = function( deployment_id, callback  ){
    logger.trace('getting deployment outputs');
    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format(this.config.endpoint + '/deployments/{0}/outputs', deployment_id )
        },
        callback
    );
};

/**
 * @typedef {object} DeploymentModificationClient~DeploymentModificationNodeInstances
 * @property {object} added_and_related list of added nodes and nodes that related to them
 * @property {object} removed_and_related list of removed nodes and nodes that related to them
 */

/**
 * @typedef {object} DeploymentModificationClient~DeploymentModification
 * @property {string} deployment_id deployment id the outputs belong to
 * @property {object} node_instances
 * @property {object} node_instances.added_and_related
 * @property {object} node_instances.remove_and_related
 * @property {object} modified_nodes original request modified nodes dict
 */


/**
 * @class DeploymentModificationClient
 * @param {ClientConfig} config
 * @constructor
 */
function DeploymentModificationClient( config ){
    this.config = config;
}


/**
 * @description
 * start deployment modification
 * @param {string} deployment_id the deployment id
 * @param {object} nodes the nodes to modify
 * @param {ApiCallback} callback body get the deployment modification
 */
DeploymentModificationClient.prototype.start = function( deployment_id, nodes, callback){
    logger.trace('starting deployment modification');
    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'PATCH',
            'json' : true,
            'url' : String.format(this.config.endpoint + '/deployments/{0}/modify', deployment_id ),
            'body' : {
                'stage' : 'start',
                'nodes' : nodes
            }
        },
        callback
    );
};

/**
 * @description
 * finish deployment modification
 * @param  {string} deployment_id the deployment id
 * @param {object} modification the modification response received on 'start'
 * @param {ApiCallback} callback body gets the deployment modification
 */
DeploymentModificationClient.prototype.finish = function( deployment_id, modification, callback ){
    logger.trace('finishing deployment modification');

    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }
    return this.config.request(
        {
            'method' : 'PATCH',
            'json' : true,
            'url' : String.format(this.config.endpoint + '/deployments/{0}/modify', deployment_id ),
            'body' : {
                'stage' : 'finish',
                'modification' : modification
            }
        },
        callback
    );
};

/**
 *
 * @class DeploymentsClient
 * @description api calls for deployments
 * @param {ClientConfig} config
 * @constructor
 */

function DeploymentsClient( config ){
    this.config = config;
    this.outputs = new DeploymentOutputsClient( config );
}

/**
 * @description
 * returns a list of all deployments
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets a list of deployments
 */
DeploymentsClient.prototype.list = function( _include, callback ){
    logger.trace('listing deployments');
    var qs = {};

    if ( !!_include ){
        qs._include = _include;
    }


    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/deployments',
            qs : qs
        },
        callback
    );

};

/**
 * @description
 * returns a deployment by its id.
 * @param {string} deployment_id id of the deployment to get
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets deployment
 */
DeploymentsClient.prototype.get = function (deployment_id, _include, callback) {
    logger.trace('getting deployment');
    if (!deployment_id) {
        callback(new Error('blueprint_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint  + '/deployments/{0}', deployment_id )
        },
        callback
    );
};


/**
 * @description
 * creates a new deployment for the provided blueprint id and deployment id
 * @param {string} blueprint_id blueprint id to create a deployment of
 * @param {string} deployment_id deployment id of the new created deployment
 * @param {object|null} [inputs] inputs obj for the deployment
 * @param {ApiCallback} callback body get the created deployment
 */
DeploymentsClient.prototype.create = function( blueprint_id, deployment_id, inputs, callback ){
    logger.trace('creating deployment');
    if ( !blueprint_id ){
        callback( new Error('blueprint_id is missing'));
        return;
    }

    if ( !deployment_id ){
        callback( new Error('deployment_id is missing'));
        return;
    }

    var body = {
        'blueprint_id': blueprint_id
    };

    if ( inputs ){
        body.inputs = inputs;
    }

    return this.config.request(
        {
            'method' : 'PUT',

            // we recommend the following algorithm to know if you need Content-Type: application/json
            // if json: true ==> set header Content-Type application/json.
            // you should not rely on overriding the header as the github issue below specified so.

            // https://github.com/iriscouch/browser-request/issues/54

            //'headers' : { // https://cloudifysource.atlassian.net/browse/CFY-2996
            //    'Content-Type' : 'application/json'
            //},
            'json' : true,
            'url' : String.format( this.config.endpoint + '/deployments/{0}', deployment_id ),
            'body' : body
        },
        callback // expected status code 201
    );
};

/**
 *
 * @description
 * delets the deployment whose id matches the provided deployment id.
 * by default, deployment with live nodes deletion is not allowed and
 * this behavior can be changed using the ignore_live_nodes arguments.
 *
 * @param {string} deployment_id the deployment's to be deleted id.
 * @param {boolean|null} [ignore_live_nodes=false] determines whether to ignore live nodes.
 * @param {ApiCallback} callback body gets the deleted deployment
 */
DeploymentsClient.prototype.delete = function( deployment_id, ignore_live_nodes, callback ){
    logger.trace('deleting deployment');
    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }

    var qs = {};

    if ( ignore_live_nodes === true ){
        qs.ignore_live_nodes = 'true';
    }

    return this.config.request(
        {
            'method' : 'DELETE',
            'json': true,
            'url' : String.format( this.config.endpoint + '/deployments/{0}', deployment_id ),
            qs: qs
        },
        callback
    );
};

/**
 * @description
 * returns a deployment workflows by deployment id
 * @param {string} deployment_id id of the deployment to get its workflows
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets workflows
 */
DeploymentsClient.prototype.get_workflows = function( deployment_id, _include, callback ){
    logger.trace('getting workflows');
    if ( !deployment_id ){
        callback(new Error('blueprint_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint  + '/deployments/{0}/workflows', deployment_id )
        },
        callback
    );
};




module.exports = DeploymentsClient;