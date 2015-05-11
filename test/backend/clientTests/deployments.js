'use strict';

describe('deployments:', function () {
    var depName = 'HelloWorld-' + Date.now();

    it('should create a deployment', function (done) {
        testClient.deployments.create('HelloWorld', depName, null, function (err, response, body) {

            testClient.deployments.get(depName, null, function (err, response, body) {
                expect(body).to.be.ok();
                expect(response.statusCode).to.be(200);
                var deployment = JSON.parse(body);
                expect(deployment).to.be.ok();
                done();
            });

        });
    });

    it('should list deployments and find ' + depName, function (done) {
        testClient.deployments.list(null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var deployments = JSON.parse(body);
            expect(deployments).to.not.be.empty();

            var deployment = _.find(deployments, {'id': depName});
            expect(deployment).to.be.ok();

            done();
        });
    });

    it('should get deployment workflows', function (done) {
        testClient.deployments.get_workflows('HelloWorld', null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);
            //console.log('response:' + JSON.stringify(response));
            //console.log('body:' + body);
            var workflows = JSON.parse(body);
            expect(workflows).to.be.ok();

            done();

        });
    });

    it('should delete a deployment', function (done) {
        testClient.deployments.delete(depName, true, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var bodyObj = JSON.parse(body);

            if (bodyObj.id) {
                // delete successful
                expect(bodyObj.id).to.be(depName);

            } else if (bodyObj.error_code) {
                // delete failed because there are running executions - considered success
                expect(bodyObj.error_code).to.be('dependent_exists_error');

            }

            done();
        });
    })

});