const passport = require('passport');


const userAuth = passport.authenticate('jwt', {session: false});

const checkRole = roles => (req, res, next) => {
    let tRole = [];
    var value = 0;

    if(req.user.role === 'BACKEND') tRole.push("BACKEND");
    if(req.user.role === 'CONTRACTOR') tRole.push("CONTRACTOR");
    if(req.user.role === 'WAREHOUSE') tRole.push("WAREHOUSE");
    if(req.user.role === 'VENDOR') tRole.push("VENDOR");

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