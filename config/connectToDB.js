const mongoose= require("mongoose");

const connectBD= async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected To MongoDB ^_^")
    } catch(error){
        console.log("Connection faild to MongoDB", error);
    }
};


module.exports= {
    connectBD
}