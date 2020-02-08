module.exports = (function() {
    var dataExt = {};

    /**
     * Counts array entries based on a selector
     * @param {Array} collection List of objects
     * @param {Function} selector Selector function to select the counted value
     * @param {Array} keys List of possible keys (optional)
     */
    function countBy(collection, selector, keys) {
        if (!selector) {
            selector = (x) => x;
        }
        let sums = {};
        if (keys) {
            for (var key of keys) {
                sums[key] = 0;
            }
        }

        for (let entry of collection) {
            let value = selector(entry);
            if (sums[value]) {
                sums[value]++;
            } else {
                sums[value] = 1;
            }
        }
        return sums;
    };
    dataExt.countBy = countBy;

    return dataExt;
})();