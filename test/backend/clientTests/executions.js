'use strict';

var execution;

describe('executions:', function () {
    it('should list executions', function( done ){
        testClient.executions.list('HelloWorld', null, function(err, response, body){
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var executions = JSON.parse(body);
            expect(executions).to.not.be.empty();

            testClient.executions.get(executions[0].id, null, function(err, response, body) {
                expect(body).to.be.ok();
                expect(response.statusCode).to.be(200);

                var execution = JSON.parse(body);
                expect(execution.id).to.be(executions[0].id);

                done();
            });

        });

    });

    it('should execute install workflow', function(done) {
        // this uses the nodecellar deployment since we later want to cancel it so we need something that takes a long time.
        testClient.deployments.get('nodecellar', null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var deployment = JSON.parse(body);
            expect(deployment).to.be.ok();

            var workflow = _.find(deployment.workflows, {'name': 'install'});
            expect(workflow.name).to.be('install');

            testClient.executions.start('nodecellar', workflow.name, workflow.parameters, false, false, function (err, response, body) {
                expect(body).to.be.ok();
                expect(response.statusCode).to.be(201);

                execution = body;
                expect(execution.id).to.be.ok();

                done();
            });

        });
    });

    it('should cancel an execution', function(done) {
        // cancel the nodecellar install workflow execution.
        testClient.executions.cancel(execution.id, true, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            done();
        });

    });

});