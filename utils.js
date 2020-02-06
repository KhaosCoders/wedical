/**
 * Adds a breadcrump link to the page
 * @param {string} title Button title
 * @param {string} link Link to follow for the button
 */
const addBreadcrump = function(title, link) {
    return function(req, res, next) {
        res.locals.breadcrumps = res.locals.breadcrumps || [];
        res.locals.breadcrumps.push({
            title: title,
            link: link,
        });
        next();
    }
}

module.exports = { addBreadcrump };