'use strict';


/**
 * @typedef {object}  CloudifyClient~ClientConfig
 * @property {string} endpoint the cloudify rest api endpoint. (e.g. http://manager-host-ip)
 * @property {object} authHeaders - header  as map of {key,value} for authentication implementation with cloudify. This object will be merged with request opts when a request is generated. they will override if key exists.
 * @property {object} [request] a request implementation. {@see https://www.npmjs.com/package/browser-request} . {@see https://www.npmjs.com/package/request}
 * frontend implementations will pass the browser version, and nodejs version should pass the node version.
 *
 *
 **/


var Blueprints = require('./blueprints');
var Events = require('./events');
var Deployments = require('./deployments');
var Executions = require('./executions');
var Manager = require('./manager');
var NodeInstances = require('./nodeInstances');
var Nodes = require('./nodes');
var Search = require('./search');
var Evaluate = require('./evaluate');
/**
 *
 * @param {ClientConfig} config
 * @constructor CloudifyClient
 */
function Client( config ){

    // add security support. currently basic username/password support
    var origRequest = config.request;

    config.request = function( opts, callback ){
        opts.auth = config.cloudifyAuth;
        origRequest(opts, callback);
    };

    this.config = config; // keep config

    this.blueprints = new Blueprints( config );
    this.events = new Events( config );
    this.deployments = new Deployments( config );
    this.executions = new Executions( config );
    this.manager = new Manager( config );
    this.nodeInstances = new NodeInstances( config );
    this.nodes = new Nodes( config );
    this.search = new Search( config );
    this.evaluate = new Evaluate( config );
}

module.exports = Client;




/*****************************
 * Add 'format' message to String.
 ******************************/

String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};