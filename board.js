const fs = require('fs'),
  path = require('path'),
  express = require('express'),
  Mincer = require('mincer'),
  coffee = require('coffee-script'),
  Prometheus = require('./utils/prometheus'),
  logger = require("./config/config.logger").logger;

global.SCHEDULER = require('node-schedule');

module.exports.Board = function Board() {
  var boardjs = {};
  boardjs.root = path.resolve(__dirname);
  boardjs.NODE_ENV = process.env.NODE_ENV || 'development';
  boardjs.view_engine = 'ejs';

  boardjs.mincer = {};
  boardjs.mincer.environment = new Mincer.Environment();
  boardjs.mincer.assets_prefix = '/assets';
  boardjs.mincer.environment.appendPath('assets/javascripts');
  boardjs.mincer.environment.appendPath('assets/stylesheets');
  boardjs.mincer.environment.appendPath('assets/fonts');
  boardjs.mincer.environment.appendPath('assets/images');
  boardjs.mincer.environment.appendPath('widgets');
  boardjs.mincer.environment.appendPath('public');

  boardjs.public_folder = boardjs.root + '/public';
  boardjs.views = boardjs.root + '/dashboards';
  boardjs.default_dashboard = null;
  boardjs.port = (process.env.PORT || 3030);

  boardjs.protected = function(req, res, next) {
    next();
  };

  boardjs._protected = function(req, res, next) {
    boardjs.protected(req, res, next);
  };

  var expressLoggerOptions = {
    format: 'dev',
    stream: {
      write: function(message, encoding) {
        logger.info(message);
      }
    }
  };

  // setup Express
  var app = express();

  app.set('views', boardjs.views);
  app.set('view engine', boardjs.view_engine);
  app.use(require('express-ejs-layouts'));

  app.use(Prometheus.requestCounters);  
  app.use(Prometheus.responseCounters);
  
  app.use(express.logger(expressLoggerOptions));
  app.use(express.errorHandler());
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(boardjs.mincer.assets_prefix, Mincer.createServer(boardjs.mincer.environment));
  app.use(express.static(boardjs.public_folder));
  app.use(app.router);  
  app.set('development', boardjs.NODE_ENV === 'development');
  app.set('production', boardjs.NODE_ENV === 'production');

  var connections = {};
  var history = {};


  /* http routes */

  // /metrics route
  Prometheus.injectMetricsRoute(app);

  app.get('/events', boardjs._protected, function(req, res) {
    // let request last as long as possible
    req.socket.setTimeout(0);

    var conn = {
      id: (new Date().getTime().toString() + Math.floor(Math.random() * 1000).toString()),
      send: function(body) {
        res.write(body);
        res.flush(); // need to flush with .compress()
      }
    };
    connections[conn.id] = conn;

    // send headers for event-stream connection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable buffering for nginx
    });
    res.write('\n');
    res.write(Array(2049).join(' ') + '\n'); // 2kb padding for IE
    res.write(latest_events());
    res.flush(); // need to flush with .compress()

    req.on('close', function() {
      delete connections[conn.id];
    });
  });

  app.get('/', function(req, res) {
    if (boardjs.default_dashboard) {
      res.redirect(boardjs.default_dashboard);
    } else {
      first_dashboard(function(err, dashboard) {
        if (err) {
          next(err);
        } else if (dashboard) {
          res.redirect(dashboard);
        } else {
          next(new Error('There are no dashboards in your dashboard directory.'));
        }
      });
    }
  });

  app.get('/:dashboard', boardjs._protected, function(req, res) {
    var dashboard = req.params.dashboard;
    fs.exists([boardjs.views, dashboard + '.' + boardjs.view_engine].join(path.sep), function(exists) {
      if (exists) {
        res.render(dashboard, {
          dashboard: dashboard,
          request: req
        });
      } else {
        res.status(404).sendfile(boardjs.public_folder + '/404.html');
      }
    });
  });

  app.get('/views/:widget?.html', boardjs._protected, function(req, res) {
    var widget = req.params.widget;
    res.sendfile([boardjs.root, 'widgets', widget, widget + '.html'].join(path.sep));
  });

  app.post('/widgets/:id', function(req, res) {
    var auth_token = req.body.auth_token;
    if (!boardjs.auth_token || boardjs.auth_token == auth_token) {
      send_event(req.params.id, req.body);
      res.send(204);
    } else {
      res.send(401, 'Invalid API key');
    }
  });

  // The 404 Route (ALWAYS Keep this as the last route)
  app.use(function(req, res, next) {
    res.status(404).sendfile(boardjs.public_folder + '/404.html');
  });

  // Error handler
  app.use(function(err, req, res, next) {
    logger.error(err.stack);
    res.send(500, err);
  });

  function send_event(id, body) {
    body.id = id;
    body.updatedAt = Date.now();
    var event = format_event(body);
    history[id] = event;
    for (var k in connections) {
      connections[k].send(event);
    }
  }
  global.send_event = send_event;

  function format_event(body) {
    return 'data: ' + JSON.stringify(body) + '\n\n';
  }

  function latest_events() {
    var str = [];
    for (var id in history) {
      str.push(history[id]);
    }
    return str.join('');
  }

  function first_dashboard(fn) {
    fs.readdir(boardjs.views, function(err, files) {
      if (err) fn(err);
      var regex = new RegExp('(\w*)\.' + boardjs.view_engine + '$');
      for (var i in files) {
        var file = files[i];
        if (file.match(regex) && file !== 'layout.' + boardjs.view_engine) {
          fn(null, file.substring(0, file.length - (boardjs.view_engine.length + 1)));
          return;
        }
      }
      fn(null, null);
    });
  }

  // Lod jobs files
  var job_path = process.env.JOB_PATH || [boardjs.root, 'jobs'].join(path.sep);
  fs.readdir(job_path, function(err, files) {
    if (err) throw err;
    for (var i in files) {
      var file = [job_path, files[i]].join(path.sep);
      if (file.match(/(\w*)\.job\.(js|coffee)$/)) {
        logger.info('Loading job file:', files[i]);
        require(file);
      }
    }
  });

  // bootstraping the app
  boardjs.start = function() {

    Prometheus.startCollection();

    app.listen(boardjs.port);
    logger.info('application is started using '+ boardjs.NODE_ENV +' environment and listening on port: ' + boardjs.port);
  
  };

  boardjs.app = app;
  return boardjs;

};
