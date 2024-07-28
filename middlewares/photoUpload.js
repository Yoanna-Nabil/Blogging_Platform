const path= require("path");
const multer= require("multer");

const storage= multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, '../images'))
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    }
});

const photoUpload= multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        if(file.mimetype.startsWith("image")){
            cb(null, true);
        } else{
            cb({message: "Unsupported file formate"}, false)
        }
    },
    limits: {fileSize: 1024 * 1024} //1 mega bit 
});

module.exports= {
    photoUpload 
}