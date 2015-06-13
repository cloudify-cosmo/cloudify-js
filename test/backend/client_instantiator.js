'use strict';

var conf = require('./config.js');

/**
 * conf/dev/meConf.json holds the connection configuration:
 *
 * {
        "endpoint": "http://cloudify.localhost.com",
        "cloudifyAuth": {
            "user": "__user__",
            "pass": "__pass__"
        }
    }
 *
 */


/**
 * This sets up the testClient and lodash.
 *
 * The testClient's endpoint is configured to point to cloudify.localhost.com.
 * The manager is expected to have at least one blueprint called 'HelloWorld' installed.
 *
 * Usage:
 *      require('../client_instantiator');
 */
console.log('instantiating with conf', conf);
if (typeof(window) !== 'undefined') {
    window.testClient = new TestClient(conf);

} else if (!!global) {
    global.testClient = new TestClient(conf);
}