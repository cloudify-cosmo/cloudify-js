'use strict';
beforeEach(function(){

    if ( typeof(window) !== 'undefined' ) {
        window.testClient = new TestClient({endpoint: 'http://cloudify.localhost.com'});
    }else if ( !!global ){
        global.testClient = new TestClient({endpoint: 'http://cloudify.localhost.com'});
    }
});