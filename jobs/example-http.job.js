// example external api consumption via http

const requestHelper = require('../utils/requests');


// get the initial request out
requestHelper.getHttpbinData();

// setup recurring data fetch
setInterval(function(){  
    requestHelper.getHttpbinData();    

}, 10 * 60 * 1000); // check every 10 minutes