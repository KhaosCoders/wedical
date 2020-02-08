const debug = require('debug')('wedical:manage-roles');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const sanitizerExt = require('../../extension/sanitizer-ext');
const { Auth } = require('../../auth');
const { addBreadcrump } = require('../../utils');
var Role = require('../../models/role');

// CSRF
var csrfProtection = csrf();

async function getRole(req, res) {
    if (req.params.id) {
        debug(`Get role with id: ${req.params.id}`);
        res.setHeader('CSRF-Token', req.csrfToken());
        let role = await Role.findOne({ _id: req.params.id });
        if (role) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ data: role.toPOJO() }));
        } else {
            debug('ERROR: Role not found!');
        }
    } else {
        debug('ERROR: Called GET without ID');
    }
    res.status(404).end('not found');
}

async function addRole(req, res) {
    // Create new role
    let role = await Role.create({
        name: req.body[`name`],
    });

    // Grant rights
    grantRights(role, req);
    await role.save();

    res.setHeader('CSRF-Token', req.csrfToken());
    res.status(200).end('ok');
}

function grantRights(role, req) {
    for (var [key, value] of Object.entries(req.body)) {
        if (key.startsWith('r_') && value === 'on') {
            let parts = key.split('_');
            let field = {};
            field[parts[2]] = [parts[3]];
            Auth.grant(role, parts[1], field);
            // remove body field, so assign() can be used afterwards
            delete req.body[key];
        }
    }
}

async function delRole(req, res) {
    if (req.params.id) {
        debug(`Deleting role with id: ${req.params.id}`);
        res.setHeader('CSRF-Token', req.csrfToken());
        let role = await Role.findOne({ _id: req.params.id });
        if (role) {
            if (role.buildIn) {
                return res.status(403).end('forbidden');
            }
            await role.remove();
            return res.status(200).end('ok');
        } else {
            debug('ERROR: Role not found!');
        }
    } else {
        debug('ERROR: Called DELETE without ID');
    }
    res.status(404).end('not found');
}

async function putRole(req, res) {
    if (req.params.id) {
        debug(`Put role with id: ${req.params.id}`);
        res.setHeader('CSRF-Token', req.csrfToken());
        let role = await Role.findOne({ _id: req.params.id });
        if (role) {
            if (role.buildIn) {
                return res.status(403).end('forbidden');
            }
            // Change authorization profile first
            delete role.auth;
            grantRights(role, req);
            // Assign other fields
            role.assign(req.body);
            await role.save();
            return res.status(200).end('ok');
        } else {
            debug('ERROR: Guest not found!');
        }
    } else {
        debug('ERROR: Called PUT without ID');
    }
    res.status(404).end('not found');
}

async function listRoles(req, res) {
    res.setHeader('CSRF-Token', req.csrfToken());
    res.setHeader('Content-Type', 'application/json');
    let roles = await Role.find();
    res.end(JSON.stringify({ data: roles.map(g => g.toPOJO()) }));
}

// Define the roles page route
router.get('/',
    csrfProtection,
    Auth.authenticate('/manage/roles'),
    Auth.authorize('manage', { 'Segment': 'roles' }),
    addBreadcrump('User Roles', '/manage/roles'),
    function(req, res) {
        res.render('manage/roles', {
            csrfToken: req.csrfToken(),
            authorizationOptions: Role.authorizationOptions,
        });
    });

// /list feeds DataTable in client with data
router.get('/list',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'roles' }),
    listRoles);

// Add role
router.post('/',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'roles' }),
    addRole
);

// Remove role
router.delete('/:id',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'roles' }),
    delRole
);

// Get role
router.get('/:id',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'roles' }),
    getRole
);

// Save role
router.put('/:id',
    csrfProtection,
    Auth.authenticate(false),
    Auth.authorize('manage', { 'Segment': 'roles' }),
    sanitizerExt.removeBody(['_id', 'createdAt', 'updatedAt']),
    putRole
);

module.exports = router;