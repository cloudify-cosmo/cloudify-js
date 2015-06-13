'use strict';

describe('jquery client', function(){
    window.TestClient = $.CloudifyClient;

    require('./client_instantiator');
    require('./clientTests');
});

