const { WHITELIST } = require('./index');


var whitelist = WHITELIST.split(" ");

var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

module.export = { corsOptions }