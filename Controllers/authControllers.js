const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const {User}= require('../models/User');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {verificationToken}= require("../models/verificationToken");
const crypto= require("crypto");
const sendEmail= require("../utils/sendEmail");
const passwordComplexity = require("joi-password-complexity");


const register= asyncHandler(async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        userName: Joi.string().trim().min(2).max(100).required(),
        password: passwordComplexity().required(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    }

    var user= await User.findOne({email: req.body.email})
    if(user){
        return res.status(400).json({message: "User Already Exist"})
    }

    const salt= await bcrypt.genSalt(10);
    hashedPassword= await bcrypt.hash(req.body.password, salt);

         user= new User ({
           email: req.body.email,
           userName: req.body.userName,
           password: hashedPassword,
        })
        await user.save();

        const verificationTokens= new verificationToken({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex")
        });
        await verificationTokens.save();

        const link= `http://localhost:3000/users/${user._id}/verify/${verificationTokens.token}`;

        const htmlTemplate= `
        <div>
          <p>Click to the link below to verify email</p>
          <a href="${link}"></a>
        </div>`;
        
        await sendEmail(user.email, "Verify your email", htmlTemplate);

        res.status(201).json({message: "we sent to you an email, Please verify your email address"});
});


const login= asyncHandler(async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: passwordComplexity().required(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    }

    var user= await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({message: "Invalid Email or Password"})
    }

    const isPasswordMatch= await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordMatch){
        return res.status(400).json({message: "Invalid Email or Password"})
    };

    if(!user.isAccountVerified){
        let verificationTokens= await verificationToken.findOne({
            userId: user._id,
        });
        if(verificationTokens){
            verificationTokens= new verificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex")
            });
            await verificationTokens.save();
        };
        const link= `http://localhost:3000/users/${user._id}/verify/${verificationTokens.token}`;

        const htmlTemplate= `
        <div>
          <p>Click to the link below to verify email</p>
          <a href="${link}"></a>
        </div>`;
        
        await sendEmail(user.email, "Verify your email", htmlTemplate);

        
       return res.status(400).json({message: "we sent to you an email, Please verify your email address"});
    }

        const token= jwt.sign({id: user._id, userName: user.userName, isAdmin: user.isAdmin}, process.env.JWT_SECRET);
      
        res.status(201).json({
            _id: user._id,
            isAdmin: user.isAdmin,
            profilePhoto: user.profilePhoto,
            token
        });
});

const verifyUserAccount= asyncHandler(async(req, res) => {
    const user= await User.findById(req.params.userId);
    if(!user){
        res.status(400).json({message: "invalid link"})
    };

    const verificationTokens= await verificationToken.findOne({
        userId: user._id,
        token: req.params.token
    });
    if(!verificationTokens){
        res.status(400).json({message: "invalid link"})
    };

    user.isAccountVerified= true;
    await user.save();

    await verificationTokens.remove();

    res.status(200).json({message: "Your Account Verified"});
});

module.exports= {
    register,
    login,
    verifyUserAccount
}