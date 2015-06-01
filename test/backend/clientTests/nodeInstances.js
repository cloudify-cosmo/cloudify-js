'use strict';

var instances;

describe('nodeInstances:', function () {
    it('should list deployment nodes instances', function (done) {
        testClient.nodeInstances.list(depName, null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            instances = body;
            expect(instances).to.not.be.empty();
            done();

        });
    });

    it('should get node instance', function(done) {
        testClient.nodeInstances.get(instances[0].id, null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var instance = body;
            expect(instance.id).to.be(instances[0].id);

            done();
        });
    });

    it('should update node instance', function(done) {
        var newState = 'starting';
        var oldState = instances[0].state;
        var newProperties = {
            'kuku': 'muku'
        };
        var oldProperties = instances[0].runtime_properties;

        testClient.nodeInstances.update(instances[0].id, newState, newProperties, 0, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var instance = body;
            expect(instance.id).to.be(instances[0].id);
            expect(instance.state).to.be(newState);
            expect(instance.runtime_properties).to.eql(newProperties);

            // reset node to previous state
            testClient.nodeInstances.update(instances[0].id, oldState, oldProperties, 0, function (err, response, body) {
                expect(body).to.be.ok();
                expect(response.statusCode).to.be(200);

                done();
            });


        });

    });

});