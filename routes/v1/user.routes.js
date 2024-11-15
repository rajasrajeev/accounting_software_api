const express = require('express');
const uploadFiles = require('../../middlewares/image.middleware');
const {
    loginHandler,
    uploadFilesController,
    signupController,
    doVerification,
    forgotPasswordHanlder,
    verifyOtpHandler,
    resetPasswordHandler
} = require('../../controllers/user.controller');


const router = express.Router();
const uploads = uploadFiles.fields([{name: 'image', maxCount: 3}]);
const uploadDocs = uploadFiles.fields([
    {name: 'gst', maxCount: 1},
    {name: 'pan', maxCount: 1},
    {name: 'license', maxCount: 1}]);

module.exports = (app) => {
    router.post('/login', loginHandler);
    router.post('/upload-files', uploads, uploadFilesController );
    router.post('/signup', uploadDocs, signupController );
    router.patch('/verify/:id', doVerification)
    router.post('/forgot-password', forgotPasswordHanlder);
    router.post('/verify-otp', verifyOtpHandler);
    router.post('/reset-password', resetPasswordHandler);
    app.use('/api/v1/accounts', router);
}