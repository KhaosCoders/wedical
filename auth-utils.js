const strategies = {
    UNKNOWN: 'unknown',
    LOCAL: 'local',
};

var loginWithRedirect = function(url) {
    return '/login?redirect_url=' + encodeURIComponent(url);
};

module.exports = {
    Strategies: strategies,
    LoginWithRedir: loginWithRedirect,
};