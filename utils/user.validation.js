const userSchema = require("../schemas/user.schema");

const checkUserValidation = async (req, res) => {
    const {_, error} = userSchema.validate({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    });
    if(error) return res.status(400).send({'data': error});

    else {
        return res.status(400).send({'message': 'Invalid user role'});
    }
}

module.exports = {checkUserValidation}