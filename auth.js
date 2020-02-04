const debug = require('debug')('wedical:auth');
const session = require('express-session');
const NedbStore = require('nedb-session-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config');
var User = require('./models/user');

/**
 * Handles all the complicated authentication stuff
 *
 * @class Auth
 */
class Auth {
  /**
   * Configurates authentication middleware
   * @param {Object} app - express app instance
   */
  static useAuthentication(app) {
    // local username / password
    passport.use(new LocalStrategy(
        function(username, password, done) {
          debug(`Local user: ${usernamr} pw:${Utils.hashPw(password)}`);
          User.findOne({email: username}, function(err, user) {
            if (err) {
              debug(`Error: ${err}`);
              return done(err);
            }
            if (!user) {
              debug('ERROR: User unknown!');
              return done(null, false, {message: 'Incorrect username.'});
            }
            if (!user.validatePassword(password)) {
              debug('ERROR: Invalid password!');
              return done(null, false, {message: 'Incorrect password.'});
            }
            debug(`User successsfuly logged-in: ${username}`);
            return done(null, user);
          });
        }));

    // user session serialization
    passport.serializeUser(function(user, done) {
      debug(`Serialize user: ${user._id}`);
      done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
      debug(`Deserialize user: ${id}`);
      User.findOne({_id: id})
          .then(function(user) {
            debug('user found');
            done(null, user);
          })
          .catch(function(err) {
            debug(`ERROR: ${err}`);
            done(err);
          });
    });

    // auth middleware
    app.use(passport.initialize());
    app.use(passport.session());
  }

  /**
   * Creates the admin user if not found
   */
  static async setupAdmin() {
    debug('checking admin user');
    var admin = await User.findOne({email: config.admin.email});
    if (!admin) {
      debug('create admin user');
      admin = await User.create({
        email: config.admin.email,
      });
      admin.setLocalPw(config.admin.passwd);

      await admin.save()
          .then(function(usr, err) {
            User.findOne({email: config.admin.email}).then(function(user) {
              if (!user) {
                debug('error! admin not found!');
              }
            });
          })
          .catch(function(err) {
          });
      return;
    }
    debug('admin exists');
  }

  /**
   * Configures session middleware
   * @param {Object} app - express app instance
   */
  static useSessions(app) {
    // cookie
    var cookie = {
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false,
    };

    // production vs. dev
    if (app.get('env') === 'production') {
      debug('production environment');
      // trust first proxy
      app.set('trust proxy', 1);
      // serve secure cookies
      cookie.secure = true;
      cookie.httpOnly = true;
    } else {
      debug('development environment');
    }

    app.use(session({
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      cookie: cookie,
      store: new NedbStore({
        filename: __dirname
        + '/data/sessions.db',
      }),
    }));
  }
}

module.exports = {Auth};