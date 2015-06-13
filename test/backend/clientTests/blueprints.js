'use strict';


var _ = require('lodash');
var expect = require('expect.js');

describe('blueprints:', function(){

    var blueprintName = 'HelloWorld' + new Date().getTime();

    describe('upload & delete', function(){
        it('should upload archive', function(done){
            // we will use the archive api to upload a new blueprint
            testClient.blueprints.publish_archive( testClient.config.endpoint + '/blueprints/HelloWorld/archive', blueprintName, 'blueprint.yaml', function(err, response, body){
                expect(body.id).to.be(blueprintName);
                done();
            });
        });

        it('should delete a blueprint', function(done){
            testClient.blueprints.delete(blueprintName,null, function( err, response, body){
                expect(body.id).to.be(blueprintName);
                done();
            });
        });

    });

    it('should list blueprints', function( done ){
        testClient.blueprints.list(null, function(err, response, body){
            expect(body).to.be.withMessage('body should exist').ok();
            expect(response.statusCode).to.be(200);

            var blueprints = body;
            expect(blueprints).to.not.be.empty();

            var blueprint = _.find(blueprints, {'id': 'HelloWorld'});
            expect(blueprint).to.be.withMessage('Hello World Blueprint does not exist').ok();

            done();
        });

    });

    it('should get a blueprint', function( done ) {
        testClient.blueprints.get('HelloWorld', null, function(err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var blueprint = body;
            expect(blueprint.id).to.be('HelloWorld');

            done();
        });
    });

});