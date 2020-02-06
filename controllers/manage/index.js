const express = require('express');
const router = express.Router();
const passport = require('passport');
const { LoginWithRedir } = require('../../auth-utils');

// authentication requirement
const auth = passport.authenticate('session', {
    failureRedirect: LoginWithRedir('/manage'),
});

// Define the manage page route.
router.get('/', auth, function(req, res) {
    res.render('manage/index', null);
});

module.exports = router;