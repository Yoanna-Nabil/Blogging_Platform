const cloudinary= require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET
});

const cloudinaryUploadImage= async(fileToUpload) => {
    try{
        const data= await cloudinary.uploader.upload(fileToUpload, {
            resource_type: 'auto',
        });
        return data;
    } catch(error){
        throw new Error ("Internal server Error (cloudinary)");
    }
}

const cloudinaryRemoveImage= async(imagePublicId) => {
    try{
        const result= await cloudinary.uploader.destroy(imagePublicId)
        return result;
    } catch(error){
        throw new Error ("Internal server Error (cloudinary)");
    }
};

const cloudinaryRemoveMultipleImage= async(publicIds) => {
    try{
        const result= await cloudinary.v2.api.delete_resources(publicIds)
        return result;
    } catch(error){
        throw new Error ("Internal server Error (cloudinary)");
    }
};

module.exports= {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
}