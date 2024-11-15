const express = require('express');
const { success, error } = require('consola');
const passport = require('passport');
const cors = require('cors');

const { PORT } = require('./config/index');
const { corsOptions } = require("./config/cors");
const { 
    errorLogger, 
    errorResponder, 
    invalidPathHandler 
} = require('./middlewares/error.middleware');

const app = express();

//cors settings
app.use(cors(corsOptions));

// TEMPLATE ENGINE
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

//json payload settings
app.use(express.urlencoded({ 
    limit: "50mb", 
    extended: true, 
    parameterLimit: 50000 
}));
app.use(express.json({limit: '50mb'}));

//passport
app.use(passport.initialize());
require("./middlewares/passport.middleware")(passport);

//media files
app.use('/uploads', express.static('uploads'));

//child routes
require("./routes/v1/user.routes")(app);

// Error handling middleware
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);


// Server creator
try {
    app.listen(PORT, () => 
        success({
            message: `Server started at port ${PORT}`,
            badge: true
        })
    );
} catch (err) {
    error({
        message: `${err}`,
        badge: true
    })
}