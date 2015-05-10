'use strict';
beforeEach(function(){

    if ( typeof(window) !== 'undefined' ) {
        window.testClient = new TestClient({endpoint: 'http://cloudify.localhost.com'});
        window._ = require('lodash');
    }else if ( !!global ){
        global.testClient = new TestClient({endpoint: 'http://cloudify.localhost.com'});
        global._ = require('lodash');
    }
});