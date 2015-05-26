'use strict';

var Client = require('./lib/client');
var request = require('browser-request');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' }
    ],
    replaceConsole: true
});
var logger = log4js.getLogger('cloudify.angular');

angular.module('cloudifyjs', []);

angular.module('cloudifyjs').factory('CloudifyClient', [ '$timeout',function( $timeout ){
    /**
     * @param {ClientConfig} config
     */
    return function(config){
        if ( !config.request){
            config.request = request;
        }

        var origRequest =  config.request;
        config.request = function(){
            var origArguments = arguments;
            if ( origArguments.length > 0){
                //console.log('checking if last argument is a callback');
                var origCallback = origArguments[origArguments.length-1];
                if ( typeof(origCallback) === 'function'){
                    //console.log('replacing origCallback');
                    origArguments[origArguments.length-1] = function(){
                        var wrapperArguments = arguments;
                        //console.log('wrapper callback invoked', arguments );
                        $timeout(function(){ // using timeout instead of $rootScope.$apply. avoid `apply in progress` error message. see comments at: http://stackoverflow.com/q/12729122/1068746
                            origCallback.apply(null, wrapperArguments);
                        },0);

                    };
                }
            }
            origRequest.apply(null, origArguments );
        };

        return new Client(config);
    };
}]);

logger.trace('cloudifyjs is ready for use.');