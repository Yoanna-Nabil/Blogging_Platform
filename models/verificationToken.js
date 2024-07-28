const mongoose= require("mongoose");


const VerificationTokenSchema= new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },

    token: {
        type: String,
        required: true,
    },

}, {timestamps: true});

const verificationToken= mongoose.model("verificationToken", VerificationTokenSchema);

module.exports= {
    verificationToken
}