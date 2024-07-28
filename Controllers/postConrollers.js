const asyncHandler = require('express-async-handler');
const { Post }= require('../models/Post');
const Joi = require('joi');
const path= require("path");
const fs= require("fs");
const {cloudinaryUploadImage, cloudinaryRemoveImage}= require('../utils/cloudinary');
const { Comment }= require('../models/Comment');


const createPost= asyncHandler(async(req, res) => {
    if(!req.file){
        return res.status(400).json({message: "no file provided"});
       };

       const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200).required(),
        description: Joi.string().trim().min(10).required(),
        category: Joi.string().trim().required(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const imagePath= path.join(__dirname, `../images/${req.file.filename}`);
    
    const result= await cloudinaryUploadImage(imagePath);
    console.log(result);

    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    });

    res.status(201).json(post);
    
    fs.unlinkSync(imagePath);
});

const getAllPosts= asyncHandler(async(req, res) => {
    const {pageNumber, category}= req.query;
    const POST_PER_PAGE= 3;
    let posts;

    if(pageNumber){
      posts= await Post.find().skip((pageNumber - 1) * POST_PER_PAGE).limit(POST_PER_PAGE).sort({createdAt: -1}).populate("user", ["-password"]);
    } else if(category){
        posts= await Post.find({category}).sort({createdAt: -1}).populate("user", ["-password"]);
    } else{
        posts= await Post.find().sort({createdAt: -1}).populate("user", ["-password"]);
    }

    res.status(201).json(posts);
});

const getSinglePost= asyncHandler(async(req, res) => {
    const post= await Post.findById(req.params.id).populate("user", ["-password"]).populate("comments");

    if(!post){
        return res.status(400).json({message: "post not found"});
    };

    res.status(201).json(post);
});

const getPostCount= asyncHandler(async(req, res) => {
    const count= await Post.countDocuments();
    res.status(201).json(count);
});

const deletePost= asyncHandler(async(req, res) => {
    const post= await Post.findById(req.params.id);

    if(!post){
        return res.status(400).json({message: "post not found"});
    };

    if(req.user.isAdmin || req.user.id === post.user.toString()){
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);
        await Comment.deleteMany({postId: post._id});

        res.status(201).json({message: "Post has been deleted successfully", postId: post._id});
    } else{
        res.status(401).json({message: "access denied, forbidden"});
    }

});

const updateProfile= asyncHandler(asyncHandler(async(req, res) => {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200),
        description: Joi.string().trim().min(10),
        category: Joi.string().trim(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const post= await Post.findById(req.params.id);
    if(!post){
        res.status(404).json({message: "post not found"});
    };

    if(req.user.id !== post.user.toString()){
        return res.status(403).json({message: "access denied, you are not allowed"});
    };

    const updatedPost= await Post.findByIdAndUpdate(req.params.id, {
      $set:{
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      }
    }, {new: true}).populate("user", ["-password"]);

    res.status(201).json(updatedPost);
}));

const updatePostImage= asyncHandler(asyncHandler(async(req, res) => {
    
    if(!req.file){
        return res.status(400).json({message: "no image provided"});
       };

    const post= await Post.findById(req.params.id);
    if(!post){
        res.status(404).json({message: "post not found"});
    };

    if(req.user.id !== post.user.toString()){
        res.status(403).json({message: "access denied, you are not allowed"});
    };

    await cloudinaryRemoveImage(post.image.publicId);

    const imagePath= path.join(__dirname, `../images/${req.file.filename}`);
    const result= await cloudinaryUploadImage(imagePath);
    
    const updatedPost= await Post.findByIdAndUpdate(req.params.id, {
        $set:{
         image: {
            url: result.secure_url,
            publicId: result.public_id,
         }
        }
      }, {new: true});

      res.status(201).json(updatedPost);

      fs.unlinkSync(imagePath);
}));

const toggleLike= asyncHandler(async(req, res) => {
    const loggedInUser= req.user.id;

    let post= await Post.findById(req.params.id);
    if(!post){
        res.status(404).json({message: "post not found"});
    };

    const isPostAlreadyLiked= post.likes.find( (user) => user.toString() === loggedInUser);

    if(isPostAlreadyLiked){
        post= await Post.findByIdAndUpdate(req.params.id, {
            $pull: {
                likes: loggedInUser
            }
        }, {new: true});
    } else{
        post= await Post.findByIdAndUpdate(req.params.id, {
            $push: {
                likes: loggedInUser
            }
        }, {new: true})
    };

    res.status(201).json(post);
});


module.exports= {
    createPost,
    getAllPosts,
    getSinglePost,
    getPostCount,
    deletePost,
    updateProfile,
    updatePostImage,
    toggleLike
}