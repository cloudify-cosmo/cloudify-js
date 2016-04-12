'use strict';
var logger = require('log4js').getLogger('cloudify.maintenance');


function MaintenanceClient(config){
    this.config = config;
}

MaintenanceClient.prototype.get = function(callback){
    logger.trace('getting maintenance details');
    return this.config.request( {
        'method' : 'GET',
        'json': true,
        'url' : this.config.endpoint + '/maintenance'
    }, callback );
};

MaintenanceClient.prototype.activate = function(callback){
    logger.trace('activating maintenance mode');
    return this.config.request( {
        'method' : 'POST',
        'json': true,
        'url' : this.config.endpoint + '/maintenance/activate'
    }, callback );
};

MaintenanceClient.prototype.deactivate = function(callback){
    logger.trace('deactivating maintenance mode');
    return this.config.request( {
        'method' : 'POST',
        'json': true,
        'url' : this.config.endpoint + '/maintenance/deactivate'
    }, callback );
};

module.exports = MaintenanceClient;