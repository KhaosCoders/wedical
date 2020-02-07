const express = require('express');
const router = express.Router();
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');
var Guest = require('../../models/guest');

// Guests bread crump
var breadcrump = addBreadcrump('Guest List', '/manage/guests');

// Define the guests page route.
router.get('/',
    Auth.authenticate('/manage/guests'),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    breadcrump,
    function(req, res) {
        res.render('manage/guests', null);
    });

// /list feeds DataTable in client with data
router.get('/list',
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'guests' }),
    async function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        let guests = await Guest.find();
        res.end(JSON.stringify({ data: guests }));
    });

module.exports = router;