'use strict';

/*******************************************************


 This is not a spec file!

 We use this file to `require` it with browserify


 *********************************************************/

var expect = require('expect.js');

// add custom message to expect.js
// https://github.com/Automattic/expect.js/issues/18
expect.Assertion.prototype.withMessage = function (message) {
    this.message = message;
    return this;
};
expect.Assertion.prototype.origAssert = expect.Assertion.prototype.assert;
expect.Assertion.prototype.assert = function (truth, msg, error, expected) {
    try {
        this.origAssert( truth, msg, error, expected);
    }catch(e){
        if ( this.message ){
            throw new Error(this.message);
        }
        throw e;
    }
};



exports.blueprints = require('./blueprints.js');
exports.deployments = require('./deployments.js');
exports.executions = require('./executions.js');
exports.events = require('./events.js');
exports.manager = require('./manager.js');
exports.nodeInstances = require('./nodeInstances.js');
exports.nodes = require('./nodes.js');
exports.testFlows = require('./testFlows.js');
exports.maintenance = require('./maintenance.js');