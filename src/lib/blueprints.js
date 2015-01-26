'use strict';


/**
 * @class Blueprints
 * @param {Config} config
 * @constructor
 */
function Blueprints( config ){
    this.config = config;
}

Blueprints.prototype.get = function( callback ){
    return this.config.query('/blueprints', callback );
};

module.exports = Blueprints;