const debug = require('debug')('wedical:logout');
const express = require('express');
const router = express.Router();

// Define the logout page route.
router.get('/', function(req, res) {
    debug('user logged out');
    req.logout();
    return res.redirect('/');
});

module.exports = router;