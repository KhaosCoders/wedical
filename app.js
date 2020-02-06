const debug = require('debug')('wedical:app');
const createError = require('http-errors');
const express = require('express');
const flash = require('connect-flash');
const path = require('path');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const { Auth } = require('./auth');

// ensure admin user
Auth.setupAdmin();

// express app setup
debug('begin app setup');
var app = express();

// use morgan logger
app.use(logger('dev'));

// read coockie
app.use(cookieParser());

// parse body of POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

// sessions
Auth.useSessions(app);

// enable flash messages
app.use(flash());

/*
 * redirect dependency JS and CSS
 */
// jQuery
app.use('/js/jquery.min.js',
    express.static(__dirname +
        '/node_modules/jquery/dist/jquery.min.js'));
// Bootstrap
app.use('/js/bootstrap.bundle.min.js',
    express.static(__dirname +
        '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'));
app.use('/styles/bootstrap.min.css',
    express.static(__dirname +
        '/node_modules/bootstrap/dist/css/bootstrap.min.css'));
// eruda (mobile js debugger)
app.use('/js/eruda.js',
    express.static(__dirname +
        '/node_modules/eruda/eruda.js'));
// animate.css
app.use('/styles/animate.min.css',
    express.static(__dirname +
        '/node_modules/animate.css/animate.min.css'));

// Authentication
Auth.useAuthentication(app);

// set rendering engine to pug
app.set('view engine', 'pug');

// i18n middleware
app.use(i18n.init);
i18n.configure({
    locales: ['en', 'de'],
    defaultLocale: 'en',
    directory: __dirname + '/locales/backend',
    register: global,
});

// express helper for natively supported engines
app.use(function(req, res, next) {
    if (req.path.indexOf('.') === -1) {
        // i18n __()
        const i18nDir = __dirname + '/locales' + req.path;
        debug('Configure i18n. Load from dir: ' + i18nDir);
        i18n.configure({
            locales: ['en', 'de'],
            defaultLocale: 'en',
            directory: i18nDir,
            register: global,
        });

        debug('forward locals to template engine');
        res.locals.__ = res.__ = function() {
            return i18n.__.apply(req, arguments);
        };
        // session
        res.locals.session = req.session;
        // query
        res.locals.query = req.query;
        // flash messages
        res.locals.successes = req.flash('success');
        res.locals.dangers = req.flash('danger');
        res.locals.warnings = req.flash('warning');
        res.locals.errors = req.flash('error');
        if (Object.entries(res.locals.successes).length !== 0) { debug('successes: ' + res.locals.successes); }
        if (Object.entries(res.locals.dangers).length !== 0) { debug('dangers: ' + res.locals.dangers); }
        if (Object.entries(res.locals.warnings).length !== 0) { debug('warnings: ' + res.locals.warnings); }
        if (Object.entries(res.locals.errors).length !== 0) { debug('errors: ' + res.locals.errors); }
    }
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