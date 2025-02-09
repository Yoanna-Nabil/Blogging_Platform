const mongoose= require("mongoose");

const commentSchema= new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },

    text: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
    },
}, {timestamps: true});

const Comment= mongoose.model("Comment", commentSchema);

module.exports= {
    Comment
}