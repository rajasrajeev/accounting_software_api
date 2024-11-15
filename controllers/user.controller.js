const { 
    signin,
    signup,
    verificationUpdate,
    forgotPassword,
    verifyOtp,
    resetPassword
} = require("../services/user.service");


const loginHandler = async(req, res, next) => {
    try {
        const {username, password} = req.body;

        if(username === '' || password === '') {
            return res.status(400).send({'message': "Please enter email and password"});
        }

        const data = await signin(username, password);
        return res.status(200).send(data);
    } catch(err) {
        next(err);
    }
}


const uploadFilesController = async(req, res, next) => {
    try {
        const url = req.protocol + '://' + req.get("host");
        if (!req.files) {
            return res.status(400).send({ message: "No file uploaded" });
        }

        return res.status(200).send({ "url": url + "/uploads/files/" + req.files.image[0].originalname});
    } catch (err) {
        next(err);
    }
}


const signupController = async(req, res, next) => {
    try {
        const data = await signup(req.body, req.files);
        return res.status(201).send(data);
    } catch (err) {
        next(err);
    }
}


const doVerification = async(req, res, next) => {
    try {
        const data = await verificationUpdate(parseInt(req.params.id, 10));
        return res.status(200).send({ message : "Verification done successfully!!!"});
    } catch(err) {
        next(err);
    }
}

const forgotPasswordHanlder = async(req, res, next) => {
    try {
        const data = await forgotPassword(req.body.email);
        return res.status(200).send({ message : "An otp is send to provided email"});
    } catch(err) {
        next(err);
    }
}

const verifyOtpHandler = async(req, res, next) => {
    try {
        const data = await verifyOtp(req.body.email, req.body.otp);
        return res.status(200).send(data);
    } catch(err) {
        next(err);
    }
}

const resetPasswordHandler = async(req, res, next) => {
    try {
        await resetPassword(req.body);
        return res.status(200).send({ message : "Password reset completed successfully"});
    } catch(err) {
        next(err);
    }
}


module.exports = {
    loginHandler,
    uploadFilesController,
    signupController,
    doVerification,
    forgotPasswordHanlder,
    verifyOtpHandler,
    resetPasswordHandler
}