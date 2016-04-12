'use strict';

var expect = require('expect.js');

describe('maintenance:', function () {
    it('should get maintenance status', function (done) {
        testClient.maintenance.get(function (err, response, body) {
            expect(response.statusCode).to.be(200);
            expect(body.status).to.be('deactivated');
            done();
        });
    });

    it('should activate maintenance mode', function (done) {
        testClient.maintenance.activate(function (err, response, body) {
            expect(response.statusCode).to.be(200);
            expect(body.status).to.be('activating');
            done();
        });
    });

    it('should deactivate maintenance mode', function (done) {
        testClient.maintenance.deactivate(function (err, response, body) {
            expect(response.statusCode).to.be(200);
            expect(body.status).to.be('deactivated');
            done();
        });
    });
});