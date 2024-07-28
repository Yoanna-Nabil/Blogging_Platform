const express= require('express');
const router= express.Router();
const { photoUpload } = require('../middlewares/photoUpload');
const { createPost, getAllPosts, getSinglePost, getPostCount, deletePost, updateProfile, updatePostImage, toggleLike } = require('../Controllers/postConrollers');
const { verifyToken }= require("../middlewares/verifyToken");
const validateObjectId= require("../middlewares/validateObjectId")

router.post("/", verifyToken, photoUpload.single("image"), createPost);

router.get("/", getAllPosts);

router.get("/count", getPostCount);

router.get("/:id", validateObjectId, getSinglePost);

router.delete("/:id", validateObjectId, verifyToken, deletePost);

router.put("/:id", validateObjectId, verifyToken, updateProfile);

router.put("/update-image/:id", validateObjectId, verifyToken, photoUpload.single("image"), updatePostImage);

router.put("/like/:id", validateObjectId, verifyToken, toggleLike);

module.exports= router;