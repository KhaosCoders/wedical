const debug = require('debug')('wedical:guest');
const path = require('path');
const extend = require('extend');
const { Model, Timestamps } = require('nedb-models');

/**
 * Model for party guests
 *
 * Properties:
 * - name
 */
class Guest extends Model {
    /**
     * defines the configuration of the datastore for this model
     * @return {Object}
     */
    static datastore() {
        debug('create guest datastore');
        return {
            filename: path.join(
                __dirname,
                '../data/guests.db'),
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
                email: '',
            },
        });
    }

}

Guest.use(Timestamps);

module.exports = Guest;