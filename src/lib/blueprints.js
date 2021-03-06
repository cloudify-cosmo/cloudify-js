'use strict';


var logger = require('log4js').getLogger('cloudify.blueprints');
/**
 * @typedef {object} BlueprintsClient~Blueprint
 *
 * @property {string} id The identifier of the blueprint
 * @property {number} created_at timestamp of blueprint creation
 * @property {object} the contents of the blueprint. plan Gets the plan the blueprints represents: nodes, relationships etc..
 */

/**
 * @description
 * collection of API calls for blueprints
 * @class BlueprintsClient
 * @param {ClientConfig} config
 * @constructor
 */
function BlueprintsClient( config ){
    this.config = config;
}

/**
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets a list of blueprints
 */
BlueprintsClient.prototype.list = function( _include, callback ){
    logger.trace('listing blueprints');
    var qs = {};
    if ( !!_include ){
        qs._include = _include;
    }
    return this.config.request( {
        'method' : 'GET',
        'json': true,
        'url' : this.config.endpoint + '/blueprints',
        'qs' : qs
    }, callback );
};

/**
 * @description
 * Gets  a bluprint by its id.
 * @param {string} blueprint_id Blueprint's id to get
 * @param {IncludeParam} [_include] List of fields to include in response
 * @param {ApiCallback} callback body gets the blueprint
 */
BlueprintsClient.prototype.get = function (blueprint_id, _include, callback) {
    logger.trace('getting blueprint by id');
    var qs = {};
    if (!!_include) {
        qs._include = _include;
    }

    return this.config.request({
            'method': 'GET',
            'json': true,
            'url': String.format(this.config.endpoint + '/blueprints/{0}', blueprint_id ),
            'qs': qs
        }, callback );
};

/**
 * @description Deltes the blueprint whose id matches the provided blueprint id.
 * @param {string} blueprint_id the id of the blueprint to be deleted
 * @param {ApiCallback} callback body gets the deleted blueprint
 */
BlueprintsClient.prototype.delete = function(blueprint_id, callback ){
    logger.trace('deleting blueprint');
    return this.config.request({
        'method' : 'DELETE',
        'json': true,
        'url' : String.format(this.config.endpoint + '/blueprints/{0}', blueprint_id )
    }, callback );
};

///// ONLY ADD FUNCTION THAT MIGHT NOT BE IMPLEMENTED FROM THIS POINT ON..

// ignore undefined variables.
/* jshint unused: false */
/**
 *
 * @description
 * uploads a blueprint to cloudify's manager.
 *
 * NOTE: currently only supports uploading from URL
 *
 *
 * Archive file should contain a single directory in which there is a
 * blueprint file named `blueprint_filename` (if `blueprint_filename`
 * is None, this value will be passed to the REST service where a
 * default value should be used).
 * Blueprint ID parameter is available for specifying the
 * blueprint's unique Id.

 *
 * @exception error if function is not implemented. not all clients implement this function.
 *
 * @param {string} [blueprint_path] url to blueprint
 * @param {string} blueprint_id id of the uploaded blueprint
 * @param {ApiCallback} callback body gets the uploaded blueprint
 */
// this is not upload. upload also packs
BlueprintsClient.prototype.publish_archive = function( blueprint_path , blueprint_id, blueprint_filename, callback ){
    logger.trace('getting blueprint by id');
    var qs = {  'blueprint_archive_url' : blueprint_path , 'application_file_name' : blueprint_filename};

    return this.config.request({
        'method': 'PUT',
        //'json': true, // guy - for some reason, in frontend it causes REST server to fail..
        'url': String.format(this.config.endpoint + '/blueprints/{0}', blueprint_id ),
        'qs': qs
    }, function(err, response, body){
        if ( typeof(body) === 'string' ){
            try{
                body = JSON.parse(body);
            }catch(e){

            }
            callback(err, response, body);
        }
    } );
};

/**
 *
 * @description
 * downloads aa previously uploaded blueprint from cloudify's manager.
 *
 * @param {string} blueprint_id
 * @param {string} output_file
 * @param {ApiCallback} callback body gets the path of downloaded  blueprint
 */
BlueprintsClient.prototype.download = function( blueprint_id, output_file, callback  ){
    logger.trace('downloading blueprint');
    throw new Error('this function is not implemented');
};

/**
 *
 * @description
 * browse a previously downloaded blueprint.
 *
 * @param {string} blueprint_id
 * @param {number} last_update
 * @param {ApiCallback} callback body gets the content of blueprint files tree
 */
BlueprintsClient.prototype.browse = function (blueprint_id, last_update, _include, callback) {
    logger.trace('browse blueprint');
    throw new Error('this function is not implemented');
};

/**
 *
 * @description
 * browse a specific file content from a downloaded blueprint.
 *
 * @param {string} blueprint_id
 * @param {string} file_path
 * @param {ApiCallback} callback body gets the content of blueprint files tree
 */
BlueprintsClient.prototype.browseFile = function (blueprint_id, file_path, _include, callback) {
    logger.trace('browse blueprint');
    throw new Error('this function is not implemented');
};


module.exports = BlueprintsClient;