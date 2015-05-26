'use strict';


var logger = require('log4js').getLogger('cloudify.executions');
/**
 * @typedef {object} ExecutionsClient~Execution
 *
 * @property {string} id The execution's id.
 * @property {string} deployment_id the deployment's id this execution is related to.
 * @property {string} the execution's status
 * @property {string} error the execution error in a case of failure, otherwise null.
 * @property {string} workflow_id the id of the workflow this execution represents.
 * @property {object} parameters the execution's parameters
 * @property {CloudifyTimestamp} created_at the execution creation time
 */

/**
 * @description
 * collection of API calls for executions
 * @class ExecutionsClient
 * @param {ClientConfig} config
 * @constructor
 */
function ExecutionsClient( config ){
    this.config = config;
}


/**
 *
 * @description
 * returns a list of executions
 * @param {string|null} [deployment_id] optional deployment id to get executions for.
 * @param {IncludeParam|null} [_include] list of fields to include in response.
 * @param {ApiCallback} callback body gets executions list
 */
ExecutionsClient.prototype.list = function( deployment_id, _include, callback  ){
    logger.trace('listing executions');
    var qs = {};

    if ( deployment_id ){
        qs.deployment_id = deployment_id;
    }

    if ( _include ){
        qs._include = _include;
    }

    this.config.request(
        {
            'method' : 'GET',
            'url' : this.config.endpoint + '/executions',
            qs:qs
        },
        callback
    );
};


/**
 * @description
 * get execution by its id.
 * @param {string} execution_id id of the execution to get.
 * @param {IncludeParam|null} [_include] list of fields to include in response.
 * @param {ApiCallback} callback body gets the execution
 */
ExecutionsClient.prototype.get = function( execution_id, _include, callback ){
    logger.trace('getting execution');
    if ( !execution_id ){
        callback(new Error('execution_id is missing'));
        return;
    }

    var qs = {};

    if ( _include ){
        qs._include = _include;
    }

    this.config.request(
        {
            'method' : 'GET',
            'url' : String.format( this.config.endpoint + '/executions/{0}', execution_id ),
            'qs' : qs
        },
        callback
    );
};


/**
 *
 * @description
 * update execution with the provided status and optional error.
 * @param {string} execution_id id of the execution to update
 * @param {string} status updated execution status
 * @param {string|null} [error] updated execution error
 * @param {ApiCallback} callback body gets updated execution
 */
ExecutionsClient.prototype.update = function( execution_id, status, error, callback ){
    logger.trace('updating execution');
    if ( !execution_id ){
        callback( new Error('execution_id is missing'));
        return;
    }

    var body = { 'status' : status };
    if ( !error ){
        body.error = error;
    }

    this.config.request(
        {
            'method' : 'PATCH',
            'url' : String.format( this.config.endpoint + '/executions/{0}', execution_id ),
            'json' : true,
            'body' : body
        },
        callback
    );
};

/**
 *
 * @description
 * starts a deployment's workflow execution whose id is provided.
 *
 * @param {string} deployment_id the deployment's id to execute a workflow for.
 * @param {string} workflow_id the workflow to be executed id.
 * @param {object|null} [parameters] parameters for the workflow execution.
 * @param {boolean|null} [allow_custom_parameters=false] determines whether to allow parameters which weren't defined in
 * the workflow parameters schema in the blueprint.
 * @param {boolean|null} [force=false] determines whether to force the execution of the workflow in a case where there's
 * an already running execution for this deployment.
 * @param {ApiCallback} callback the body gets the created execution
 */
ExecutionsClient.prototype.start = function( deployment_id, workflow_id, parameters, allow_custom_parameters, force, callback ){
    logger.trace('starting execution');
    if ( !deployment_id ){
        callback( new Error('deployment_id is missing'));
        return;
    }
    if ( !workflow_id ){
        callback( new Error('workflow_id is missing'));
        return;
    }

    var body = {
        'deployment_id' : deployment_id,
        'workflow_id' : workflow_id
    };

    if ( parameters ){
        body.parameters = parameters;
    }

    if ( allow_custom_parameters === true ){
        body.allow_custom_parameters = 'true';
    }else{
        body.allow_custom_parameters = 'false';
    }

    if ( force === true ){
        body.force = 'true';
    }else{
        body.force = 'false';
    }

    this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/executions',
            'body' : body,
            'json' : true
        },
        callback
    );
};

/**
 *
 * @description
 * cancels the execution which matches the provided execution id.
 * @param {string} execution_id id of the execution to cancel
 * @param {boolean|null} [force=false] whether to send a 'cancel' or a 'force-cancel' action
 * @param {ApiCallback} callback body gets cancelled execution
 */
ExecutionsClient.prototype.cancel = function( execution_id, force, callback ){
    logger.trace('cancelling execution');
    if ( !execution_id ){
        callback( new Error('execution_id is missing'));
        return;
    }

    var body = {  };

    if ( force === true ){
        body.action = 'force-cancel';
    }else{
        body.action = 'cancel';
    }

    this.config.request(
        {
            'method' : 'POST',
            'url' : String.format(this.config.endpoint + '/executions/{0}', execution_id),
            'json' : true,
            'body' : body
        },
        callback // expected status code = 201
    );
};


module.exports = ExecutionsClient;