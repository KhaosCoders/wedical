const express = require('express');
const router = express.Router();
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');

// Manage bread crump
var manageBC = addBreadcrump('Manage', '/manage');

// Define the manage page route.
router.get('/',
    Auth.authenticate('/manage'),
    Auth.authorize('manage', {}),
    manageBC,
    function(req, res) {
        res.render('manage/index', null);
    });

module.exports = router;