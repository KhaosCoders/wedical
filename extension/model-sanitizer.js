const { Extension } = require('nedb-models');

/**
 * @summary
 * A extension to nedb-models
 * Use this extension to sanitize your model
 * before saving data
 *
 * The model class needs a sanitize() function
 */
class ModelSanitizer extends Extension {
    apply() {
        let __class = this.__class;

        if ('function' !== typeof __class.prototype.sanitize) {
            throw new Error('sanitize method not defined in model class')
        }
        let sanitize = __class.prototype.sanitize;

        this.set('save', save => {
            return async function() {
                sanitize.call(this);
                await save.call(this);
                return this;
            };
        }, true);

        return true;
    }
}

module.exports = ModelSanitizer