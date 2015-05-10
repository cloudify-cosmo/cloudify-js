'use strict';

describe('blueprints', function(){

    it('should list blueprints', function( done ){
        testClient.blueprints.list(null, function(err, response, body){
            expect(body).to.be.ok();

            var blueprints = JSON.parse(body);
            expect(blueprints).to.not.be.empty();

            var blueprint = _.find(blueprints, {'id': 'HelloWorld'});
            expect(blueprint).to.be.ok();

            done();
        });

    });
});