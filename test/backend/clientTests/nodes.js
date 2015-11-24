'use strict';

var nodes;
var expect = require('expect.js');

describe('nodes:', function () {
    it('should list deployment nodes', function (done) {
        testClient.nodes.list('nodecellar', null, null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            nodes = body.items;
            expect(nodes).to.not.be.empty();
            done();

        });
    });

    it('should get node', function(done) {
        testClient.nodes.get('nodecellar', nodes[0].id, null, function (err, response, body) {
            expect(response.body).to.be.ok();
            expect(response.statusCode).to.be(200);

            body = response.body.items[0];
            expect(body.id).to.be(nodes[0].id);

            done();
        });
    });

});