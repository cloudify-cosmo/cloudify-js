'use strict';
/*******************************************************


 This is not a spec file!

 We use this file to `require` it with browserify


 *********************************************************/


describe('list blueprints', function(){

    require('./client_instantiator');

    it('should list blueprints', function( done ){
        testClient.blueprints.list(null, function(){
            console.log('these re arguments',arguments);
            expect(1+1).to.be(3);
            done();
        });

    });
});