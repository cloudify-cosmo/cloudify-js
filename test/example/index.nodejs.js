var CloudifyClient = require('../../src/cloudify');

var client = new CloudifyClient({'endpoint' : 'http://192.168.40.51'});
var logger = require('log4js').getLogger('index.nodejs');

client.blueprints.list(null, function( err, response, body){
    logger.info('this is body',body);

});