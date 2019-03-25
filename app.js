// The main entry file for boardjs app

var boardjs = require('./board.js').Board();

// reading config data based on the environment
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.'+env+'.json');

/*
boardjs.protected = function(req, res, next) {
  // Put any authentication code you want in here.
  // This method is run before accessing any resource.
  // if (true) next();
}
*/

// Set your default dashboard here
//boardjs.default_dashboard = 'mydashboard';
boardjs.config = config;

// start application
boardjs.start();
