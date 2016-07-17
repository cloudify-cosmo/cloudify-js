'use strict';

var expect = require('expect.js');

describe('providerContext:', function () {
    it('should get provider context', function (done) {
        testClient.providerContext.get(function (err, response, body) {
            expect(response.statusCode).to.be(200);
            expect(body).to.be.ok();
            expect(body.context).not.to.be(undefined);
            done();
        });
    });

    it('should update provider context', function (done) {
        testClient.providerContext.update('provider',{someContext:{someKey: 'someValue'}},function (err, response, body) {
            expect(response.statusCode).to.be(200);
            expect(body).to.be.ok();
            done();
        });
    });
});