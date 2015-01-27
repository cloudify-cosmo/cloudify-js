'use strict';

var logger = require('log4js').getLogger('blueprints');
/**
 * @typedef {object} Blueprint
 *
 * @property {string} id The identifier of the blueprint
 * @property {number} created_at timestamp of blueprint creation
 * @property {object} the contents of the blueprint. plan Gets the plan the blueprints represents: nodes, relationships etc..
 */

/**
 * @description
 * collection of API calls for blueprints
 * @class Blueprints
 * @param {ClientConfig} config
 * @constructor
 */
function Blueprints( config ){
    this.config = config;
}

/**
 * @param {string} _include list of fields to include in response
 * @param {ApiCallback} callback
 * @returns {Array<Blueprint>} a list of currently stored blueprints.
 */
Blueprints.prototype.list = function( _include, callback ){
    logger.trace('listing blueprints');
    var qs = {};
    if ( !!_include ){
        qs._include = _include;
    }
    return this.config.request( {
        'method' : 'GET',
        'url' : this.config.endpoint + '/blueprints',
        'qs' : qs
    }, callback );
};

module.exports = Blueprints;