const express = require('express');
const router = express.Router();
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');

// Manage bread crump
var breadcrump = addBreadcrump('Manage', '/manage');

// Define the manage page route.
router.get('/',
    Auth.authenticate('/manage'),
    Auth.authorize('manage', {}),
    breadcrump,
    function(req, res) {
        res.render('manage/index', null);
    });

// load guests routes (auth is handled inside!)
router.use('/guests', breadcrump, require('./guests'));


module.exports = router;