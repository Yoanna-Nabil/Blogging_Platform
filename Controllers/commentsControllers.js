const asyncHandler = require('express-async-handler');
const { Comment }= require('../models/Comment');
const {User}= require('../models/User');
const Joi = require('joi');


const createComment= asyncHandler(async(req, res) => {
    const schema = Joi.object({
        postId: Joi.string().required(),
        text: Joi.string().required(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const profile= await User.findById(req.user.id);

    const comment= await Comment.create({
      postId: req.body.postId,
      text: req.body.text,
      userEmail: profile.email,
      userName: profile.userName,
      user: req.user.id
    });

    res.status(201).json(comment);
});

const getAllComments= asyncHandler(async(req, res) => {
    const comments= await Comment.find().populate("user", ["-password"]);
    res.status(200).json(comments);
});

const deleteComment= asyncHandler(async(req, res) => {
    const comment= await Comment.findById(req.params.id);
    if(!comment){
        res.status(404).json({message: "comment not found"});
    };

    if(req.user.isAdmin || req.user.id === comment.user.toString()){
        await Comment.findByIdAndDelete(req.params.id); 
        res.status(200).json({message: "post has been deleted"});
    } else{
        res.status(404).json({message: "access denied, not allowed"});
    }
});

const updateComment= asyncHandler(async(req, res) => {
    const schema = Joi.object({
        text: Joi.string(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const comment= await Comment.findById(req.params.id);
    if(!comment){
        res.status(404).json({message: "comment not found"});
    };

    if( req.user.id !== comment.user.toString()){
        res.status(403).json({message: "access denied, only user himself can edit his comment"});
    };

    const updatedComment= await Comment.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text
        }
    }, {new: true});

    res.status(201).json(updatedComment);
});


module.exports={
    createComment,
    getAllComments,
    deleteComment,
    updateComment
}