var express = require('express');
var router = express.Router();

// load invite route
router.use('/invite', require('./invite'));

// load management routes
router.use('/manage', require('./manage'));

// load login route
router.use('/login', require('./login'));

// Define the home page route.
router.get('/', function(req, res) {
  res.render('index', null);
});

module.exports = router;

