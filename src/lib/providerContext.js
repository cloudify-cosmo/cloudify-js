'use strict';

var logger = require('log4js').getLogger('cloudify.providerContext');

function ProviderContextClient( config ){
    this.config = config;
}

ProviderContextClient.prototype.get = function (callback) {
    logger.trace('getting provider context');
    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/provider/context'
    }, callback );
};

ProviderContextClient.prototype.update = function (name, context, callback) {
    logger.trace('updating provider context');
    var body = {
        name: name,
        context: context
    };
    return this.config.request({
        'method': 'POST',
        'json': true,
        'url': this.config.endpoint + '/provider/context?update=true',
        'body': body
    }, callback );
};


module.exports = ProviderContextClient;