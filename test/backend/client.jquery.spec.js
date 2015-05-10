'use strict';

describe('jquery client', function(){
    it('should exist', function(){
        window.TestClient = $.CloudifyClient;
    });
});

require('./clientTests');