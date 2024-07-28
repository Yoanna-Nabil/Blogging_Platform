const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const {User}= require('../models/User');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {verificationToken}= require("../models/verificationToken");
const crypto= require("crypto");
const sendEmail= require("../utils/sendEmail");


const sendingResetPasswordLink= asyncHandler(async(req, res) => {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const user=  await User.findOne({email: req.body.email});
    if(!user){
      return req.status(404).json({message: "user with given email doesn't exist"});
    };

    let verificationTokens= await verificationToken.findOne({userId: user._id});
    if(!verificationTokens){
        verificationTokens= new verificationToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        });
        await verificationTokens.save();
        
        const link= `http://localhost:3000/reset-password/${user_id}/${verificationTokens.token}`;

        const htmlTemplate= `<a href="${link}">Click here to reset your password</a>`;

        await sendEmail(user.email, "Reset Password", htmlTemplate);

        res.status(200).json({message: "password reset link sent to your email, please ckeck your inbox"});
    };

});

const getResetPasswordLink= asyncHandler(async(req, res) => {
  const user= await User.findById(req.params.id);
  if(!user){
    return res.status(400).json({message: "invalid link"});
  };

  let verificationTokens= await verificationToken.findOne({userId: user._id, token: req.params.token});
  if(!verificationTokens){
    return res.status(400).json({message: "invalid link"});
  };

  res.status(200).json({message: "valid url"});
});

const resetPassword= asyncHandler(async(req, res) => {
    const schema = Joi.object({
        password: Joi.string().trim().min(8).required(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const user=  await User.findById(req.params.userId);
    if(!user){
      return req.status(404).json({message: "invalid link"});
    };

    let verificationTokens= await verificationToken.findOne({userId: user._id, token: req.params.token});
     if(!verificationTokens){
      return res.status(400).json({message: "invalid link"});
  };

  if(!user.isAccountVerified){
    user.isAccountVerified= true;
  };

  const salt= await bcrypt.genSalt(10);
  hashedPassword= await bcrypt.hash(req.body.password, salt);
  
  user.password= hashedPassword;
  await user.save();
  await verificationTokens.remove();

  res.status(200).json({message: "password reset successfully, please log in"});
});

module.exports= {
    sendingResetPasswordLink,
    getResetPasswordLink,
    resetPassword
}