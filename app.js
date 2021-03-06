const debug = require('debug')('wedical:app');
const fs = require('fs');

// Abort when config is missing
let app = null;
if (!fs.existsSync(__dirname + '/config.js')) {
    console.log('Please setup config.js first!');
    module.exports = app;
    return;
}

const createError = require('http-errors');
const express = require('express');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const flash = require('connect-flash');
const path = require('path');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const config = require('./config');
const {
    Auth
} = require('./auth');
const i18nExt = require('./extension/i18n-ext');

// ensure admin user
Auth.setupRoles().then(Auth.setupAdmin);

// express app setup
debug('begin app setup');
app = express();

// use morgan logger
app.use(logger('dev'));

// read coockie
app.use(cookieParser());

// parse body of POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

// use helmet for protection
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', '*.googleusercontent.com', 'platform-lookaside.fbsbx.com'],
    }
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
app.use('/js/jquery.min.js.map',
    express.static(__dirname +
        '/node_modules/jquery/dist/jquery.min.js.map'));
app.use('/js/jquery.form.min.js',
    express.static(__dirname +
        '/node_modules/jquery-form/dist/jquery.form.min.js'));
app.use('/js/jquery.form.min.js.map',
    express.static(__dirname +
        '/node_modules/jquery-form/dist/jquery.form.min.js.map'));
app.use('/js/jquery.quicksearch.min.js',
    express.static(__dirname +
        '/node_modules/jquery.quicksearch/dist/jquery.quicksearch.min.js'));
app.use('/js/jquery.quicksearch.min.js.map',
    express.static(__dirname +
        '/node_modules/jquery.quicksearch/dist/jquery.quicksearch.min.js.map'));
// Bootstrap
app.use('/js/bootstrap.bundle.min.js',
    express.static(__dirname +
        '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'));
app.use('/js/bootstrap.bundle.min.js.map',
    express.static(__dirname +
        '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map'));
app.use('/styles/bootstrap.min.css',
    express.static(__dirname +
        '/node_modules/bootstrap/dist/css/bootstrap.min.css'));
app.use('/styles/bootstrap.min.css.map',
    express.static(__dirname +
        '/node_modules/bootstrap/dist/css/bootstrap.min.css.map'));
// eruda (mobile js debugger)
app.use('/js/eruda.js',
    express.static(__dirname +
        '/node_modules/eruda/eruda.js'));
// animate.css
app.use('/styles/animate.min.css',
    express.static(__dirname +
        '/node_modules/animate.css/animate.min.css'));
// fontawesome
let faDir = __dirname + '/node_modules/@fortawesome/fontawesome-free';
app.use('/styles/fontawesome.min.css',
    express.static(faDir +
        '/css/all.min.css'));
fs.readdirSync(faDir + '/webfonts').forEach(file => {
    app.use('/webfonts/' + file,
        express.static(faDir + '/webfonts/' + file));
});
// datatables
let dtDir = __dirname + '/node_modules/datatables.net-dt';
app.use('/styles/datatables.min.css',
    express.static(dtDir + '/css/jquery.dataTables.min.css'));
fs.readdirSync(dtDir + '/images').forEach(file => {
    app.use('/images/' + file,
        express.static(dtDir + '/images/' + file));
});
app.use('/styles/datatables.bootstrap4.min.css',
    express.static(__dirname +
        '/node_modules/datatables.net-bs4/css/dataTables.bootstrap4.min.css'));
app.use('/js/dataTables.bootstrap4.min.js',
    express.static(__dirname +
        '/node_modules/datatables.net-bs4/js/dataTables.bootstrap4.min.js'));
app.use('/js/dataTables.min.js',
    express.static(__dirname +
        '/node_modules/datatables.net/js/jquery.dataTables.min.js'));
// toggle switches
app.use('/js/bootstrap4-toggle.min.js',
    express.static(__dirname +
        '/node_modules/bootstrap4-toggle/js/bootstrap4-toggle.min.js'));
app.use('/styles/bootstrap4-toggle.min.css',
    express.static(__dirname +
        '/node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css'));

// Authentication
Auth.useAuthentication(app);

// set rendering engine to pug
app.set('view engine', 'pug');

// i18n middleware
app.use(i18n.init);
var i18nOptions = {
    locales: config.locales,
    defaultLocale: 'en',
    queryParameter: 'lang',
    cookie: 'lang',
    directory: __dirname + '/locales/backend',
    register: global,
};
i18n.configure(i18nOptions);

// express helper for natively supported engines
app.use(function (req, res, next) {
    if (req.path.indexOf('.') === -1) {
        // Save user locale to cookie
        if (req.query.lang && i18nOptions.locales.includes(req.query.lang)) {
            res.cookie('lang', req.query.lang, {
                maxAge: 900000,
                httpOnly: true
            });
        }
        // Load a hierarchy of locales into i18n module
        i18nExt.configureHierarchy(__dirname + '/locales', req.path, i18nOptions);

        debug('forward locals to template engine');
        // i18n __()
        res.locals.__ = res.__ = function () {
            return i18n.__.apply(req, arguments);
        };
        // page title
        res.locals.title = config.title;
        // possible locales
        res.locals.locales = config.locales;
        // session
        res.locals.session = req.session;
        // query
        res.locals.query = req.query;
        // query
        res.locals.user = req.user;
        // flash messages
        res.locals.successes = req.flash('success');
        res.locals.dangers = req.flash('danger');
        res.locals.warnings = req.flash('warning');
        res.locals.errors = req.flash('error');
        if (Object.entries(res.locals.successes).length !== 0) {
            debug('successes: ' + res.locals.successes);
        }
        if (Object.entries(res.locals.dangers).length !== 0) {
            debug('dangers: ' + res.locals.dangers);
        }
        if (Object.entries(res.locals.warnings).length !== 0) {
            debug('warnings: ' + res.locals.warnings);
        }
        if (Object.entries(res.locals.errors).length !== 0) {
            debug('errors: ' + res.locals.errors);
        }
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

// file uploads
app.use(fileUpload({
    // 5MB Limit
    limits: {
        fileSize: 5 * 1024 * 1024
    },
}));

// Use the controllers.
app.use(require('./controllers'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

debug('end app setup');
module.exports = app;