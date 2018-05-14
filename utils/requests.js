// shared http requests for retrieval of 3rd party data

var request = require('request');

// ignore self signed certs
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


module.exports.getHttpbinData = getHttpbinData;



function getHttpbinData() {

    // request confing
    var options = {  
        url: 'http://httpbin.org/get',
        method: 'GET',
        headers: {
            'User-Agent': 'boardjs-agent'
        }
    };

    // api request
    request(options, function(err, res, body) {
        
        if (!err){

            try {
                var json = JSON.parse(body);               
                var headers;
                var headers = json.headers;
                send_event('headers-data', {value: headers});          
            
            } catch (e) {
                logger.error('error while working with response json. '+ e);          
            }
        }
        else {
            logger.error('external data request failed:'+err);
        }
    });

}