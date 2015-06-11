// override this file if you want to have different configuration


module.exports = { 'endpoint' : 'http://localhost' };

try{ // for development purposes allow this code to run. put the file under 'dev'
    module.exports = require(process.env.TEST_ME_CONF);
}catch(e){} // don't let it ruin the front end code

