'use strict';

var expect = require('expect.js');

describe('deploymentUpdates:', function(){

    it('should update from a url with default workflow and get it', function(done){
        testClient.deploymentUpdates.update('nodecellar_updated', 'https://github.com/cloudify-cosmo/cloudify-nodecellar-example/archive/3.3.1.zip', undefined, 'local-blueprint.yaml', {skipInstall: false, skipUninstall:false}, function(err, response, body) {
            expect(response.statusCode).to.be(200);
            expect(body.deployment_id).to.be('nodecellar_updated');
            expect(body.id).not.to.be(undefined);
            expect(body.state).to.be('committing');
            var updateId = body.id;

            testClient.deploymentUpdates.get(updateId, function(err, response, body){
                expect(response.statusCode).to.be(200);
                expect(typeof body).to.be('object');
                expect(body.deployment_id).to.be('nodecellar_updated');
                done();
            });
        });
    });

    //TODO find a way to get an archive while running on a browser
    //it('should update from an archive with custom workflow', function(done){
        //var archive = ;
        //testClient.deploymentUpdates.update('HelloWorld',archive, null, 'blueprint.yaml', {workflowId: 'update'},function(err, response, body) {
        //    expect(response.statusCode).to.be(200);
        //    expect(body.deployment_id).to.be('HelloWorld');
        //    expect(body.id).not.to.be(undefined);
        //    expect(body.state).to.be('committing');
        //    done();
        //});
    //});

    it('should get deploymentUpdates list', function(done){
        testClient.deploymentUpdates.list({deployment_id: 'nodecellar_updated'},function(err, response, body){
            expect(response.statusCode).to.be(200);
            expect(Array.isArray(body.items)).to.be(true);
            done();
        });
    });
});