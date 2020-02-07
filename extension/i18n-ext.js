const debug = require('debug')('wedical:i18nExt');
const i18n = require('i18n');
const fs = require('fs');
const path = require('path');

module.exports = (function() {
    var i18nExt = {};

    i18nExt.addLocaleFile = function(locale, file) {
        // get i18n catalog instance
        let catalog = i18n.getCatalog();
        if (!catalog) {
            return;
        }

        // load file
        let localeFile = fs.readFileSync(file);
        let newLocale = JSON.parse(localeFile);

        // merge existing with new locales
        catalog[locale] = catalog[locale] ? {...catalog[locale], ...newLocale } : newLocale;
    };

    i18nExt.configureHierarchy = function(baseDir, requestPath, i18nOptions) {
        i18nOptions = i18nOptions || {};
        i18nOptions.locales = i18nOptions.locales || ['en'];
        i18nOptions.extension = i18nOptions.extension || '.json';

        let i18nPath = baseDir;

        // i18n base configuration
        i18nOptions.directory = i18nPath;
        i18n.configure(i18nOptions);

        for (let dir of requestPath.split('/')) {
            if (dir) {
                i18nPath = path.join(i18nPath, dir);
                for (let locale of i18nOptions.locales) {
                    let file = path.join(i18nPath, locale + i18nOptions.extension);
                    if (fs.existsSync(file)) {
                        i18nExt.addLocaleFile(locale, file);
                    }
                }
            }
        }
    };

    return i18nExt;
})();