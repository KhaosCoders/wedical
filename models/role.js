const debug = require('debug')('wedical:role');
const path = require('path');
const extend = require('extend');
const { Model, Timestamps } = require('nedb-models');

/**
 * Model for user roles
 *
 * Properties:
 * - name
 * - auth
 * - buildIn
 */
class Role extends Model {
    /**
     * defines the configuration of the datastore for this model
     * @return {Object}
     */
    static datastore() {
        debug('create role datastore');
        return {
            filename: path.join(
                __dirname,
                '../data/roles.db'),
            inMemoryOnly: false,
        };
    }

    /**
     * Defines default values
     * @return {Object}
     */
    static defaults() {
        return extend(true, super.defaults(), {
            values: {
                name: '',
                auth: [],
                buildIn: false,
            },
        });
    }

}

Role.use(Timestamps);

// all possible authorizations
Role.authorizationOptions = {
    'manage': {
        'text': 'Manage',
        'fields': {
            'Segment': {
                'text': 'Segment',
                'options': {
                    'guests': 'Guests',
                    'invites': 'Invites',
                    'users': 'Users',
                    'roles': 'Roles',
                },
            },
        },
    },
}

module.exports = Role;