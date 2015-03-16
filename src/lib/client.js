'use strict';

/**
 * @callback ApiCallback
 * @param error an error if one occurred. null or undefined otherwise.
 * @param response the http response
 * @param body the http response body
 * @description callback for API calls.
 */

/**
 * @typedef {object}  ClientConfig
 * @property {string} endpoint the cloudify rest api endpoint. (e.g. http://manager-host-ip)
 * @property {object} [request] a request implementation. {@see https://www.npmjs.com/package/browser-request} . {@see https://www.npmjs.com/package/request}
 * frontend implementations will pass the browser version, and nodejs version should pass the node version.
 **/

/**
 * @type {Blueprints}
 */
var Blueprints = require('./blueprints');
/**
 * @type {Deployments}
 */
var Deployments = require('./deployments');
/**
 *
 * @param {ClientConfig} config
 * @constructor
 */
function Client( config ){
    this.blueprints = new Blueprints( config );
    this.deployments = new Deployments( config );
}

module.exports = Client;