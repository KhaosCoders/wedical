const debug = require('debug')('wedical:manage-guests');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const reqSanitizer = require('../../extension/request-sanitizer');
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');
var Guest = require('../../models/guest');

// CSRF
var csrfProtection = csrf();

async function getGuest(req, res) {
    if (req.params.id) {
        debug(`Get guest with id: ${req.params.id}`);
        res.setHeader('CSRF-Token', req.csrfToken());
        let guest = await Guest.findOne({ _id: req.params.id });
        if (guest) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ data: guest.toPOJO() }));
        } else {
            debug('ERROR: Guest not found!');
        }
    } else {
        debug('ERROR: Called GET without ID');
    }
    res.status(404).end('not found');
}

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
    res.setHeader('CSRF-Token', req.csrfToken());
    res.status(200).end('ok');
}

async function delGuest(req, res) {
    if(req.params.id) {
        debug(`Deleting guest with id: ${req.params.id}`);
        res.setHeader('CSRF-Token', req.csrfToken());
        let guest = await Guest.findOne({ _id: req.params.id});
        if (guest) {
            await guest.remove();
            return res.status(200).end('ok');
        } else {
            debug('ERROR: Guest not found!');
        }
    }
    else {
        debug('ERROR: Called DELETE without ID');
    }
    res.status(404).end('not found');
}

async function putGuest(req, res) {
    if (req.params.id) {
        debug(`Put guest with id: ${req.params.id}`);
        res.setHeader('CSRF-Token', req.csrfToken());
        let guest = await Guest.findOne({ _id: req.params.id });
        if (guest) {
            guest.assign(req.body);
            await guest.save();
            return res.status(200).end('ok');
        } else {
            debug('ERROR: Guest not found!');
        }
    } else {
        debug('ERROR: Called PUT without ID');
    }
    res.status(404).end('not found');
}

async function listGuests(req, res) {
    res.setHeader('CSRF-Token', req.csrfToken());
    res.setHeader('Content-Type', 'application/json');
    let guests = await Guest.find();
    res.end(JSON.stringify({ data: guests.map(g => g.toPOJO()) }));
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
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    listGuests);

// Add guests
router.post('/',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    addGuests
);

// Remove guest
router.delete('/:id',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    delGuest
);

// Get guest
router.get('/:id',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    getGuest
);

// Save guest
router.put('/:id',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    reqSanitizer.removeBody(['_id', 'createdAt', 'updatedAt']),
    putGuest
);

module.exports = router;