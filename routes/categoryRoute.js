const express= require('express');
const router= express.Router();
const { verifyToken, verifyTokenAndAdmmin }= require("../middlewares/verifyToken");
const validateObjectId= require("../middlewares/validateObjectId");
const { createCategory, getAllCategories, deleteCategory } = require('../Controllers/categoryControllers');


router.post('/', verifyTokenAndAdmmin, createCategory);

router.get('/', getAllCategories);

router.delete('/:id', validateObjectId, verifyTokenAndAdmmin, deleteCategory);



module.exports= router;