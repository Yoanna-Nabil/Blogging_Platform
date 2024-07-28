const express= require('express');
const router= express.Router();
const { getAllUsers, getUserById, updatedUser, getUsersCount, profilePhotoUpload, deleteUserProfile, followUser } = require('../Controllers/usersControllers');
const { verifyTokenAndAdmmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } = require('../middlewares/verifyToken');
const validateObjectId= require('../middlewares/validateObjectId');
const { photoUpload } = require('../middlewares/photoUpload');

router.get('/profile', verifyTokenAndAdmmin, getAllUsers);

router.get('/profile/:id', validateObjectId, getUserById);

router.put('/profile/:id', validateObjectId, verifyTokenAndOnlyUser, updatedUser);

router.get('/count', verifyTokenAndAdmmin, getUsersCount);

router.post('/profile/profile-photo-upload', verifyToken, photoUpload.single("image"), profilePhotoUpload);

router.delete('/profile/:id', validateObjectId, verifyTokenAndAuthorization, deleteUserProfile);

router.post('/follow/:id', validateObjectId, verifyToken,  followUser);


module.exports= router;