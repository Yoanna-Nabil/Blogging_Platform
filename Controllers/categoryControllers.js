const asyncHandler = require('express-async-handler');
const {Category}= require("../models/Category");
const Joi = require('joi');

const createCategory= asyncHandler(async(req, res) => {
    const schema = Joi.object({
        title: Joi.string().required(),
    })

    const {error}= schema.validate(req.body);

    if(error){
     return res. status(400).json({message: error.details[0].message})
    };

    const category= await Category.create({
        title: req.body.title,
        user: req.user.id
    });

    res.status(201).json(category);
});

const getAllCategories= asyncHandler(async(req, res) => {
    const categories= await Category.find();
    res.status(200).json(categories);
});

const deleteCategory= asyncHandler(async(req, res) => {
    const category= await Category.findById(req.params.id);
    if(!category){
        res.status(404).json({message: "category not found"});
    };
    
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "category has been deleted", categoryId: category._id});
  });


module.exports= {
    createCategory,
    getAllCategories,
    deleteCategory
}