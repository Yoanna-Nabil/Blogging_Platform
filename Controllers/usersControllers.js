const asyncHandler = require('express-async-handler');
const {User}= require('../models/User');
const Joi = require('joi');
const path= require("path");
const fs= require("fs");
const {cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage}= require('../utils/cloudinary');
const { Post }= require('../models/Post');
const { Comment }= require('../models/Comment');


const getAllUsers= asyncHandler(async(req, res) => {
    const users= await User.find().select('-passsword').populate("posts");
    res.status(200).json(users);
});

const getUserById= asyncHandler(async(req, res) => {
    const user= await User.findById(req.params.id).select('-password').populate("posts");
    if(user){
        res.status(200).json(user)
    } else{
        res.status(404).json({message: 'User not found'})
    }
});

const updatedUser= asyncHandler(async(req, res) => {

    const schema = Joi.object({
        userName: Joi.string().trim().min(5).max(100),
        password: Joi.string().trim().min(6),
        bio: Joi.string(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    }

    if(req.body.password){
        const salt= await bcrypt.genSalt(10);
        req.body.password= await bcrypt.hash(req.body.password, salt)
    }

    const updatedUser= await User.findByIdAndUpdate(req.params.id, {
        $set: {
            userName: req.body.userName,
            password: req.body.password,
            bio: req.body.bio,
        }
    }, {new: true}).select('-password');
    res.status(200).json(updatedUser)
});

const getUsersCount = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    res.status(200).json(count );
});

const profilePhotoUpload= asyncHandler(async(req, res) => {
    if(!req.file){
     return res.status(400).json({message: "no file provided"});
    };

    const imagePath= path.join(__dirname, `../images/${req.file.filename}`);
    
    const result= await cloudinaryUploadImage(imagePath);
    console.log(result);
    
    const user= await User.findById(req.user.id);

    if(user.profilePhoto.publicId !== null){
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    };

    user.profilePhoto= {
        url: result.secure_url,
        publicId: result.public_id
    };
    await user.save();

    res.status(200).json({message: "your profile photo uploaded successfully"});
    fs.unlinkSync(imagePath);
});

const deleteUserProfile= asyncHandler(async(req, res) => {
    const user= await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    };

    const posts= await Post.find({user: user._id});
    const publicIds= posts?.map ( (post) => post.image.publicId); 
    if(publicIds?.length > 0){
        await cloudinaryRemoveMultipleImage(publicIds)
    };

    await cloudinaryRemoveImage(user.profilePhoto.publicId);
    await Post.deleteMany({user: user._id});
    await Comment.deleteMany({user: user._id});

    res.status(200).json({message: "User has been deleted"});
});

const followUser= asyncHandler(async(req, res) => {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
        return res.status(404).json({ msg: 'User not found' });
    }

    if (user.following.includes(targetUser.id)) {
        return res.status(400).json({ msg: 'Already following this user' });
    }

    user.following.push(targetUser.id);
    targetUser.followers.push(user.id);

    await user.save();
    await targetUser.save();

    res.status(200).json({ massage: 'User followed' });
})

module.exports= {
    getAllUsers,
    getUserById,
    updatedUser,
    getUsersCount,
    profilePhotoUpload,
    deleteUserProfile,
    followUser
}
