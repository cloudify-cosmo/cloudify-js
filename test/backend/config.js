// override this file if you want to have different configuration

// set reasonable defaults
if ( typeof(window) !== 'undefined' ){
    module.exports = { 'endpoint' : 'http://localhost:9876/cloudify-api' }; // points to karma proxy

}else{
    module.exports = { 'endpoint' :  process.env.CLIENT_ENDPOINT || 'http://localhost/api/v2.1' }; // point directly to localhost manager
}

try{ // for development purposes allow this code to run. put the file under 'dev'
    module.exports = require(process.env.TEST_ME_CONF);
}catch(e){} // don't let it ruin the front end code

