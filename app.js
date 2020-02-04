var debug = require('debug')('wedical:app');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var bodyParser = require('body-parser');
var i18n = require('i18n');
const {Auth} = require('./auth');

// ensure admin user
Auth.setupAdmin();

// express app setup
debug('begin app setup');
var app = express();

// use morgan logger
app.use(logger('dev'));

// sessions
Auth.useSessions(app);

/*
 * redirect dependency JS and CSS
 */
// jQuery
app.use('/js/jquery.min.js',
    express.static(__dirname
    + '/node_modules/jquery/dist/jquery.min.js'));
// Bootstrap
app.use('/js/bootstrap.bundle.min.js',
    express.static(__dirname
    + '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'));
app.use('/styles/bootstrap.min.css',
    express.static(__dirname
    + '/node_modules/bootstrap/dist/css/bootstrap.min.css'));
// eruda (mobile js debugger)
app.use('/js/eruda.js',
    express.static(__dirname
    + '/node_modules/eruda/eruda.js'));
// animate.css
app.use('/styles/animate.min.css',
    express.static(__dirname
    + '/node_modules/animate.css/animate.min.css'));

// parse body of POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Authentication
Auth.useAuthentication(app);

// set rendering engine to pug
app.set('view engine', 'pug');

// i18n middleware
app.use(i18n.init);
i18n.configure({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  directory: __dirname + '/locales',
  register: global,
});

// express helper for natively supported engines
app.use(function(req, res, next) {
  // i18n __()
  debug('forward i18n to template engine');
  res.locals.__
    = res.__
    = function() {
        return i18n.__.apply(req, arguments);
      };
  // session
  debug('forward session to template engine');
  if (!req.session.views) {
    req.session.views = 1;
  }
  res.locals.session = req.session;
  next();
});

// use SASS middleware
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true,
}));

// serve static files.
app.use(express.static(path.join(__dirname, 'public')));

// Use the controllers.
app.use(require('./controllers'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

debug('end app setup');
module.exports = app;
