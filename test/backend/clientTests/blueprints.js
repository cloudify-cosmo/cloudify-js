'use strict';

describe('blueprints:', function(){

    it('should list blueprints', function( done ){
        testClient.blueprints.list(null, function(err, response, body){
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var blueprints = JSON.parse(body);
            expect(blueprints).to.not.be.empty();

            var blueprint = _.find(blueprints, {'id': 'HelloWorld'});
            expect(blueprint).to.be.ok();

            done();
        });

    });

    it('should get a blueprint', function( done ) {
        testClient.blueprints.get('HelloWorld', null, function(err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var blueprint = JSON.parse(body);
            expect(blueprint.id).to.be('HelloWorld');

            done();
        });
    });

    xit('should validate blueprint', function(done) {
        testClient.blueprints.validate('HelloWorld', null, function(err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            done();
        });
    });
});