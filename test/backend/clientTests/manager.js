'use strict';
var expect = require('expect.js');

describe('manager:', function () {
    it('should get manager status', function (done) {
        testClient.manager.get_status(function(err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            var manager = body;
            expect(manager.status).to.be('running');

            done();
        });
    });

    it('should get manager version', function (done) {
        testClient.manager.get_version(function(err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            done();
        });
    });

    it('should get manager context', function (done) {
        testClient.manager.get_context(null, function(err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            done();
        });
    });

});