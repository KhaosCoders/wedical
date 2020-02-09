module.exports = (function() {
    var reqSanitizer = {};

    /**
     * Removes a value from the request body
     * @param {string} key Key of the value that should be removed
     */
    function removeBody(key) {
        return function(req, res, next) {
            let rem = function(req, k) {
                if (typeof k === 'string') {
                    if (req.body[k]) {
                        delete req.body[key];
                    }
                }
            }

            if (Array.isArray(key)) {
                for (let k of key) {
                    rem(req, k);
                }
            } else {
                rem(req, key);
            }
            next();
        };
    };
    reqSanitizer.removeBody = removeBody;

    return reqSanitizer;
})();