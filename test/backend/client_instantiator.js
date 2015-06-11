'use strict';

var conf = require('../../conf/dev/meConf.json');

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
if (typeof(window) !== 'undefined') {
    window.testClient = new TestClient(conf);
    window._ = require('lodash');

} else if (!!global) {
    global.testClient = new TestClient(conf);
    global._ = require('lodash');

}