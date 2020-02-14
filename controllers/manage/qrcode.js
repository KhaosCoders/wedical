const debug = require('debug')('wedical:manage-roles');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { check, validationResult } = require('express-validator');
const reqSanitizer = require('../../extension/request-sanitizer');
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');
var QRcode = require('../../models/qrcode');

// CSRF
var csrfProtection = csrf();

async function saveQR(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    debug('Save QR code');
    let qrcode = await QRcode.findOne();
    if (qrcode) {
        qrcode.assign(req.body);
        await qrcode.save();
        return res.redirect('/manage/qrcode');
    } else {
        debug('ERROR: Invite not found!');
    }
    res.status(404).end('not found');
}


// Define the roles page route
router.get('/',
    csrfProtection,
    Auth.authenticate('/manage/qrcode'),
    Auth.authorize('manage', { 'Segment': 'qrcode' }),
    addBreadcrump('QR Code', '/manage/qrcode'),
    async function(req, res) {
        // First or new QR-Code
        let qrcode = await QRcode.findOne();
        if (!qrcode) {
            qrcode = await QRcode.create();
        }

        res.render('manage/qrcode', {
            csrfToken: req.csrfToken(),
            errorLevels: QRcode.errorLevels,
            qrcode: qrcode,
            qrsource: await qrcode.getImageSource('jkjaFJka', 'djk')
        });
    });

// Save QR code config
router.post('/',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'qrcode' }),
    check('version').custom((value, { req }) => value >= 1 && value <= 40),
    check('errroCorrection').isIn(['L', 'M', 'Q', 'H']),
    check('logoSize').custom((value, { req }) => value >= 0 && value <= 100),
    saveQR
);

module.exports = router;