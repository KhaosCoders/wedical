var express = require('express');
var router = express.Router();

// Define the login page route.
router.get('/', function(req, res) {
  res.render('login', null);
});

module.exports = router;
