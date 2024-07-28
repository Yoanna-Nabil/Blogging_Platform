const express= require('express');
const router= express.Router();
const {register, login, verifyUserAccount}= require('../Controllers/authControllers');


router.post('/register', register);

router.post('/login', login);

router.get("/:userId/verify/:token", verifyUserAccount)

module.exports= router;
