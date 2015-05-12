'use strict';

var nodes;

describe('nodes:', function () {
    it('should list deployment nodes', function (done) {
        testClient.nodes.list('nodecellar', null, null, function (err, response, body) {
            expect(body).to.be.ok();
            expect(response.statusCode).to.be(200);

            nodes = JSON.parse(body);
            expect(nodes).to.not.be.empty();
            done();

        });
    });

    it('should get node', function(done) {
        testClient.nodes.get('nodecellar', nodes[0].id, null, function (err, response, body) {
            expect(response.body).to.be.ok();
            expect(response.statusCode).to.be(200);

            body = JSON.parse(response.body)[0];
            expect(body.id).to.be(nodes[0].id);

            done();
        });
    });

});