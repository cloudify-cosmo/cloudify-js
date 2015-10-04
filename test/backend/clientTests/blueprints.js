'use strict';


var _ = require('lodash');
var expect = require('expect.js');

describe('blueprints:', function(){

    var blueprintName = 'HelloWorld' + new Date().getTime();

    describe('upload & delete', function(){
        it('should upload archive', function(done){
            this.timeout(40000);
            // we will use the archive api to upload a new blueprint
            testClient.blueprints.publish_archive( 'https://github.com/cloudify-cosmo/cloudify-nodecellar-example/archive/3.2.zip', blueprintName, 'local-blueprint.yaml', function(err, response, body){
                console.log('this is error,  body', err, body);
                expect(err).to.be(null);
                expect(body.id).to.be(blueprintName);
                done();
            });
        } );

        it('should delete a blueprint', function(done){
            this.timeout(40000);
            testClient.blueprints.delete(blueprintName, function( err, response, body){
                expect(body.id).to.be(blueprintName);
                done();
            });
        });

    });

    it('should list blueprints', function( done ){
        testClient.blueprints.list('id', function(err, response, body){
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