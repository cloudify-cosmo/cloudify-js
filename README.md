# cloudify-js
node js client for the Cloudify REST API

[![Circle CI](https://circleci.com/gh/cloudify-cosmo/cloudify-js/tree/master.svg?style=shield)](https://circleci.com/gh/cloudify-cosmo/cloudify-js/tree/master)

This library is still under development and is not production ready.

# Description

A javascript package that supports:

 * JQuery
 * Angular
 * XHR (vanilla javascript)
 * NodeJS

and implements Cloudify3 API.


# Other languages

This API implementation follows the guidelines from its [python brother](http://cloudify-rest-client.readthedocs.org/en/latest/)

# Usage Example

You can have a look at the [test/examples](test/exmaple) folder for an example for each framework.

### In nodejs

```
npm install --save cloudify-cosmo/cloudify-js
```

```javascript
var CloudifyClient = require('cloudify-js').CloudifyClient;

var client = new CloudifyClient({'endpoint' : 'http://cloudify.localhost.com'});
var logger = require('log4js').getLogger('index.nodejs');

client.blueprints.list(null, function( err, response, body){
    logger.info('this is body',body);
});
```

### In Vanilla Javascript

```
bower install --save cloudify-cosmo/cloudify-js
```

```html
<script src="bower_components/cloudify-js/dist/cloudify.vanilla.js"></script>
<script>
    var client = new window.CloudifyClient({'endpoint': 'http://cloudify.localhost.com'});
    client.blueprints.list(null, function (err, response, body) {
        console.log('this is body', body);
    });
</script>
```

### In Angular

```
bower intall --save cloudify-cosmo/cloudify-js
```


```html
<script src="bower_components/cloudify-js/dist/cloudify.angular.js"></script>
<script>
    angular.module('cloudifyjsApp', [ 'cloudifyjs']);
    angular.module('cloudifyjsApp').controller('cloudifyjsCtrl', function($scope, $log, CloudifyClient ){
        var client = new CloudifyClient( { 'endpoint' : 'http://cloudify.localhost.com' } );
        client.blueprints.list( null, function(err, response, body ){
            $log.info('this is body', body);
        });
    });
</script>
```


### In JQuery

```
bower install --save cloudify-cosmo/cloudify-js
```

```html
<script src="bower_components/cloudify-js/dist/cloudify.jquery.js"></script>
<script>
    var client = new $.CloudifyClient({'endpoint' : 'http://cloudify.localhost.com'});
    client.blueprints.list( null, function(err, response, body ){
            console.log('this is body', body);
    });
</script>
```

# Dependencies

 * This project uses `request` and `browser-request` to get a unified API for ajax calls
 * This project uses `browserify` to build its front-end artifacts.

# Tests

To run the tests on existing cloudify manager, set CLIENT_ENDPOINT environment variable to manager's URL and run `grunt test`.  
To run the tests using vagrant, go to build/vagrant and run `vagrant up`. The scripts will install cloudify-manager, create proper blueprints and deployments and run the tests automatically.
