const debug = require('debug')('wedical:manage-guests');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { check, validationResult } = require('express-validator');
const reqSanitizer = require('../../extension/request-sanitizer');
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');
var Invite = require('../../models/invite');
var Guest = require('../../models/guest');

// CSRF
var csrfProtection = csrf();

async function listInvites(req, res) {
    res.setHeader('CSRF-Token', req.csrfToken());
    let invites = await Invite.find();
    res.json({
        data: invites
    });
}

// Define the invites page route.
router.get('/',
    csrfProtection,
    Auth.authenticate('/manage/invites'),
    Auth.authorize('manage', { 'Segment': 'invites' }),
    addBreadcrump('Invites', '/manage/invites'),
    async function(req, res) {
        res.render('manage/invites', { 
            csrfToken: req.csrfToken(),
            guests: await Guest.find(),
        });
    });

// /list feeds DataTable in client with data
router.get('/list',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'invites' }),
    listInvites);


module.exports = router;