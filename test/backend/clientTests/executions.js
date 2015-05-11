'use strict';

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

});