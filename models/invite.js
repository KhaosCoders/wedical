const debug = require('debug')('wedical:invite');
const path = require('path');
const extend = require('extend');
const { Model, Timestamps } = require('nedb-models');
const ModelSanitizer = require('../extension/model-sanitizer');

/**
 * Model for invitations
 *
 * Properties:
 * - title
 * - type (guestlist/wildcard)
 * - guests
 * - tickets
 */
class Invite extends Model {
    /**
     * defines the configuration of the datastore for this model
     * @return {Object}
     */
    static datastore() {
        debug('create invite datastore');
        return {
            filename: path.join(
                __dirname,
                '../data/invites.db'),
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
                title: '',
                guests: [],
                type: 'guestlist',
                tickets: 0
            },
        });
    }

    /**
     * Sanitize model data before storing them
     */
    sanitize() {
        this.title = this.title.trim();
        if (this.type != 'wildcard') {
            this.tickets = 0;
        }
        if (this.type != 'guestlist') {
            this.guests = [];
        } else if (!Array.isArray(this.guests)) {
            this.guests = [this.guests];
        }
    }

}

Invite.use(Timestamps);
Invite.use(ModelSanitizer);

module.exports = Invite;