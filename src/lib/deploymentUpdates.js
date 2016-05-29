'use strict';
var logger = require('log4js').getLogger('cloudify.deploymentUpdates');

function DeploymentUpdatesClient( config ){
    this.config = config;
}

DeploymentUpdatesClient.prototype.list = function(options, callback){
    logger.trace('listing deployment updates');
    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/deployment-updates',
        'qs': options
    }, callback );
};

DeploymentUpdatesClient.prototype.get = function(updateId, callback){
    logger.trace('getting deployment update '+updateId);
    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/deployment-updates/'+updateId
    }, callback );
};

/**
* @param {string} [deploymentId] deployment id to update
* @param {object | string} [archive] the new deployment archive / url to archive
* @param {string} [fileName] the blueprint.yaml file name within the archive
* @param {object} [executionOptions] should run a custom exection?
    * @param {string} [executionOptions.workflowId] the workflow id to execute on the changes
    * @param {boolean} [executionOptions.skipInstall] should not install added
    * @param {boolean} [executionOptions.skipUninstall] should not install removed
*/
DeploymentUpdatesClient.prototype.update = function (deploymentId, archive, inputs, fileName, executionOptions, callback) {
    logger.trace('updating deployment '+deploymentId);
    var json = true;
    var qs = {};
    var body = new FormData();
    if(typeof archive === 'string'){
        qs.blueprint_archive_url = archive;
    } else if(archive !== undefined){
        body.append('blueprint_archive', archive);
        json = false;
    }
    if(inputs !== undefined){
        body.append('inputs', inputs);
        json = false;
    }
    qs.application_file_name = fileName !== undefined ? fileName : undefined;
    if(typeof executionOptions === 'object'){
        if(executionOptions.workflowId !== undefined){
            qs.workflow_id = executionOptions.workflowId;
        } else{
            qs.skip_install = executionOptions.skipInstall;
            qs.skip_uninstall = executionOptions.skipUninstall;
        }
    }

    return this.config.request({
        'method': 'POST',
        'json': json,
        'url': this.config.endpoint + '/deployment-updates/'+deploymentId+'/update',
        'qs': qs,
        'body': body
    }, callback );
};

module.exports = DeploymentUpdatesClient;
