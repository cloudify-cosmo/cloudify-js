'use strict';

/**
 * This sets up the testClient and lodash.
 *
 * The testClient's endpoint is configured to point to cloudify.localhost.com.
 * The manager is expected to have at least one blueprint called 'HelloWorld' installed.
 *
 * Usage:
 *      require('../client_instantiator');
 */
if (typeof(window) !== 'undefined') {
    window.testClient = new TestClient({endpoint: 'http://cloudify.localhost.com'});
    window._ = require('lodash');
    window.depName = 'HelloWorld-' + Date.now();
} else if (!!global) {
    global.testClient = new TestClient({endpoint: 'http://cloudify.localhost.com'});
    global._ = require('lodash');
    global.depName = 'HelloWorld-' + Date.now();
}