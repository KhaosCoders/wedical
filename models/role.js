const debug = require('debug')('wedical:role');
const path = require('path');
const extend = require('extend');
const { Model, Timestamps } = require('nedb-models');

/**
 * Model for website users
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

module.exports = Role;