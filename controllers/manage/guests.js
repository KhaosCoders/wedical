const debug = require('debug')('wedical:manage-guests');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');
var Guest = require('../../models/guest');

// CSRF
var csrfProtection = csrf();

async function addGuests(req, res) {
    let index = 1;
    while (req.body[`guest${index}name`]) {
        debug(`Add guest: ${req.body[`guest${index}name`]}`);
        await Guest.create({
            name: req.body[`guest${index}name`],
            age: req.body[`guest${index}age`],
            gender: req.body[`guest${index}gender`],
            group: req.body.group,
            address: req.body.address,
        });
        index++;
    }
    res.status(200).end('ok');
}

// Define the guests page route.
router.get('/',
    csrfProtection,
    Auth.authenticate('/manage/guests'),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    addBreadcrump('Guest List', '/manage/guests'),
    function(req, res) {
        res.render('manage/guests', { csrfToken: req.csrfToken() });
    });

// /list feeds DataTable in client with data
router.get('/list',
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    async function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        let guests = await Guest.find();
        res.end(JSON.stringify({ data: guests.map(g => g.toPOJO()) }));
    });

// Add guests
router.post('/',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    addGuests
);

module.exports = router;