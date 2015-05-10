'use strict';

describe('vanilla client', function(){
    it('should exist', function(){
        window.TestClient = window.CloudifyClient;
    });
});

require('./clientTests');