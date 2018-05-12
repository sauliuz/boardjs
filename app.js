var boardjs = require('./board.js').Board();

// The main entry file for boardjs-app

/*
boardjs.protected = function(req, res, next) {
  // Put any authentication code you want in here.
  // This method is run before accessing any resource.
  // if (true) next();
}
*/

// Set your default dashboard here
//boardjs.default_dashboard = 'mydashboard';

// start application
boardjs.start();
