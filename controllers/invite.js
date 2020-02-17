const debug = require('debug')('wedical:invite');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { check, validationResult } = require('express-validator');
var Invite = require('../models/invite');

// CSRF
var csrfProtection = csrf();

/**
 * Checks if a role name is already taken
 * @param {any} value
 * @param {Object} param1
 */
async function checkTokenExists(value, { req }) {
  value = value.trim();
  let invite = await Invite.findOne({ token: value });
  if (!invite) {
      throw new Error('No invite with this token found');
  }
}

// Define the invite code page route.
router.get('/', csrfProtection, function(req, res) {
  res.render('invite/code.pug', {
    csrfToken: req.csrfToken(),
    bodyClass: 'invite invite-code',
  });
});

// Define the invite code form route.
router.post('/', 
  csrfProtection,
  check('token').notEmpty().bail().custom(checkTokenExists), 
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      debug(`invite form error: ${errors}`);  
      return res.redirect('/invite');
    }
    return res.redirect(`/invite/${req.body.token}`);
  });

// Define the invite page route.
router.get('/:id', csrfProtection, function(req, res) {
  res.render('invite/invite.pug', {
    bodyClass: 'invite',
  });
});

module.exports = router;
