import mongoose, {Schema, model} from "mongoose";

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    profileImage: {
        type: String,
        default: ""
    },
    cover: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
    likedPosts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
	}],
}, {timestamps: true})

export default model('User', userSchema)