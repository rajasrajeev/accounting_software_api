const passport = require('passport');


const userAuth = passport.authenticate('jwt', {session: false});

const checkRole = roles => (req, res, next) => {
    let tRole = [];
    var value = 0;

    tRole.forEach(function(word){
      value = value + roles.includes(word);
    });
    
    (value !== 1 && value < 1) 
        ? res.status(401).json({
            message: "Unauthorized",
            success: false
        })
        : next();
}

module.exports = {
    userAuth,
    checkRole
};