'use strict';



var logger = require('log4js').getLogger('cloudify.manager');


/**
 * @description
 * collection of API calls for manager
 * @class ManagerClient
 * @param {ClientConfig} config
 * @constructor
 */
function ManagerClient( config ){
    this.config = config;
}

/**
 * @description
 * management machine status
 * @param {ApiCallback} callback body gets the status
 */
ManagerClient.prototype.get_status = function( callback ){
    logger.trace('getting status');
    this.config.request(
        {
            'method' : 'GET',
            'url' : this.config.endpoint + '/status'
        },
        callback
    );
};

/**
 * @description
 * cloudify's management machine version information
 * @param {ApiCallback} callback body gets the version information
 */
ManagerClient.prototype.get_version = function( callback ){
    logger.trace('getting version');
    this.config.request(
        {
            'method' : 'GET',
            'url' : this.config.endpoint + '/version'
        },
        callback
    );
};

/**
 * @description
 * gets the context which was stored on management machine bootstrap.
 * The context contains cloudify specific information and cloud provider specific information

 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets the context stored in manager
 */
ManagerClient.prototype.get_context = function( _include, callback ){
    logger.trace('getting context');
    var qs = {};
    if ( _include ){
        qs._include = _include;
    }
    this.config.request(
        {
            'method' : 'GET',
            'url' : this.config.endpoint +  '/provider/context',
            'qs': qs
        },
        callback
    );
};

/**
 * @description
 * creates context in cloudify's management machine.
 * this method is usually invoked right after management machine
 * bootstrap with relevant cloudify and cloud provider context information
 *
 * @param {string} name cloud provider name
 * @param {object} context context
 * @param {ApiCallback} callback body gets create context result
 */
ManagerClient.prototype.create_context = function( name, context, callback ){
    logger.trace('creating context');
    if ( !name ){
        callback(new Error('name is missing'));
        return;
    }

    if ( !context ){
        callback(new Error('context is missing'));
        return;
    }

    var body = { 'name': name, 'context' : context };

    this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/provider/context',
            body: body
        },
        callback // expected status code 201
    );
};


module.exports = ManagerClient;