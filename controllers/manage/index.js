const express = require('express');
const router = express.Router();
const passport = require('passport');

// authentication requirement
const auth = passport.authenticate('local', {
  failureRedirect: '/login',
});

// Define the invite page route.
router.get('/', auth, function(req, res) {
  res.render('manage/index', null);
});

module.exports = router;
