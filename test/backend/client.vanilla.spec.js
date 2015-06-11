'use strict';

describe('vanilla client', function(){
    window.TestClient = window.CloudifyClient;
    require('./client_instantiator');
    require('./clientTests');

});

