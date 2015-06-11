'use strict';

describe('angular client', function(){

    beforeEach(window.module('cloudifyjs'));

    beforeEach( inject(function( CloudifyClient ){
        window.TestClient = CloudifyClient;
        require('./client_instantiator');
    }));

    require('./clientTests');
});

