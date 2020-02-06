const express = require('express');
const passport = require('passport');
const router = express.Router();
const { Auth } = require('../../auth');

// Define the manage page route.
router.get('/', Auth.authenticate('/manage'), function(req, res) {
    res.render('manage/index', null);
});

module.exports = router;