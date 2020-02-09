const debug = require('debug')('wedical:manage-guests');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');

// CSRF
var csrfProtection = csrf();

// Define the invites page route.
router.get('/',
    csrfProtection,
    Auth.authenticate('/manage/invites'),
    Auth.authorize('manage', { 'Segment': 'invites' }),
    addBreadcrump('Invites', '/manage/invites'),
    function(req, res) {
        res.render('manage/invites', { csrfToken: req.csrfToken() });
    });

module.exports = router;