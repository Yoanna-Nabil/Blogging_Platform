const express= require('express');
const router= express.Router();
const { verifyToken, verifyTokenAndAdmmin }= require("../middlewares/verifyToken");
const validateObjectId= require("../middlewares/validateObjectId");
const {createComment, getAllComments, deleteComment, updateComment}= require("../Controllers/commentsControllers");


router.post('/', verifyToken, createComment);

router.get('/', verifyTokenAndAdmmin, getAllComments);

router.delete('/:id', validateObjectId, verifyToken, deleteComment);

router.put('/:id', validateObjectId, verifyToken, updateComment);

module.exports= router;