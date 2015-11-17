'use strict';
var expect = require('expect.js');

describe('events:', function () {
    it('should get execution events', function(done) {
        testClient.executions.list({deployment_id: 'HelloWorld'}, function(err, response, body){
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var executions = body.items;
            expect(executions).to.not.be.empty();

            testClient.events.get( { execution_id : executions[0].id }, function(err, response, body) {
                expect(body).to.be.ok();
                expect(response.statusCode).to.be(200);

                expect(body.items).to.not.be.empty();

                done();
            });

        });
    });
});