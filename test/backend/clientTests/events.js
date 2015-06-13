'use strict';
var expect = require('expect.js');

describe('events:', function () {
    it('should get execution events', function(done) {
        testClient.executions.list('HelloWorld', null, function(err, response, body){
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var executions = JSON.parse(body);
            expect(executions).to.not.be.empty();

            testClient.events.get(executions[0].id, 0, 100, false, function(err, response, body) {
                expect(body).to.be.ok();
                expect(response.statusCode).to.be(200);

                expect(body.events).to.not.be.empty();

                done();
            });

        });
    });
});