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

angular.module('cloudifyjs').factory('CloudifyClient', function( $rootScope ){
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
                        $rootScope.$apply(function(){
                            origCallback.apply(null, wrapperArguments);
                        });

                    };
                }
            }
            origRequest.apply(null, origArguments );
        };

        return new Client(config);
    };
});

logger.trace('cloudifyjs is ready for use.');