'use strict';

var sinon = require('sinon');
var expect = require('expect.js');

describe('angular client', function(){

    beforeEach(window.module('cloudifyjs'));

    beforeEach(window.module(function($provide) {
        console.log('spying on timeout');
        $provide.decorator('$timeout', function() {
            return sinon.spy(function( callback ){ callback(); });
        });
    }));

    beforeEach( inject(function( CloudifyClient ){
        window.TestClient = CloudifyClient;
        require('./client_instantiator');
    }));

    require('./clientTests');


    it('should use timeout', function( done ){
        angular.mock.inject(function($timeout){
            testClient.blueprints.list(null, function(){
                expect( $timeout.calledOnce );
                done();
            });
        });
    });
});

