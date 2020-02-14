const debug = require('debug')('wedical:qrcode');
const path = require('path');
const extend = require('extend');
const { Model, Timestamps } = require('nedb-models');
const ModelSanitizer = require('../extension/model-sanitizer');
const QRCode = require('qrcode');
const config = require('../config');


class QRcode extends Model {
    /**
     * defines the configuration of the datastore for this model
     * @return {Object}
     */
    static datastore() {
        debug('create guest datastore');
        return {
            filename: path.join(
                __dirname,
                '../data/qrcode.db'),
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
                version: 3,
                errroCorrection: 'M',
                logo: '',
                logoSize: 20,
            },
        });
    }

    /**
     * Sanitize model data before storing them
     */
    sanitize() {
        this.version = parseInt(this.version);
        this.logoSize = parseInt(this.logoSize);
    }

    /**
     * Generates a QR code as Base64 image source
     * @param {string} invitation ID of inivitation
     * @param {string} code Security code of initation
     */
    async getImageSource(invitation, code) {
        let url = `${config.baseUrl}/invite/${invitation}/${code}`;
        try {
            return await QRCode.toDataURL(url, {
                errorCorrectionLevel: this.errroCorrection,
                version: this.version,
            });
        } catch (ex) {
            return `error: ${ex.message}`;
        }
    }
}

QRcode.use(Timestamps);
QRcode.use(ModelSanitizer);

QRcode.errorLevels = { 'L': 'Low (7%)', 'M': 'Medium (15%)', 'Q': 'Quartile (25%)', 'H': 'High (30%)' };

module.exports = QRcode;