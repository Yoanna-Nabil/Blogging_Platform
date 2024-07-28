const express= require('express');
const router= express.Router();
const validateObjectId= require("../middlewares/validateObjectId");
const { sendingResetPasswordLink, getResetPasswordLink, resetPassword } = require('../Controllers/passwordControllers');

router.post('/reset-password-link', sendingResetPasswordLink);

router.get('/reset-password/:userId/:token', getResetPasswordLink);

router.post('/reset-password/:userId/:token', resetPassword);


module.exports= router;