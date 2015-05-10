'use strict';


describe('angular client', function(){
    beforeEach(window.module('cloudifyjs'));
    it('should exist', inject(function( CloudifyClient ){
        window.TestClient = CloudifyClient;
    }));
});

require('./client_instantiator');
require('./clientTests');