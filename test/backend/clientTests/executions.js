'use strict';


var _ = require('lodash');
var expect = require('expect.js');


describe('executions:', function () {
    var execution;

    it('should list executions', function( done ){
        testClient.executions.list(null, null, function(err, response, body){
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var executions = JSON.parse(body);
            expect(executions).to.not.be.empty();

            execution = executions[0]; // keep the first for another test

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

            testClient.executions.start('nodecellar', workflow.name, workflow.parameters, false, false, function (err, response, execution) {
                expect(execution).to.be.ok();
                // if execution is running, we will get 400.
                // we are not here to test if REST is working correctly, just that the client is valid
                expect(response.statusCode === 201 || response.statusCode === 400).to.be(true);

                if ( response.statusCode === 400 ){
                    expect(execution.error_code).to.be('existing_running_execution_error');
                }else{
                    expect(execution.id).to.be.ok();
                }
                done();
            });

        });
    });

    it('should cancel an execution', function(done) {
        // cancel the nodecellar install workflow execution.
        testClient.executions.cancel(execution.id, true, function (err, response, body) {
            expect(body).to.be.ok();


            expect(response.statusCode === 200 || response.statusCode === 400).to.be(true);
            if ( response.statusCode === 400 ){ // most likely this is due to illegal action error..
                // again, we are not here to check if REST is working well, we are here to check that client works as expected
                expect(body.error_code).to.be('illegal_action_error');
            }
            done();
        });

    });

});