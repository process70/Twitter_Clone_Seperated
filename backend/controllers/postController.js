import Post from "../models/Post.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { notificationTypes } from "../notificationsTypes.js";
import Notification from "../models/Notification.js";

export const createPost = async(req, res) => {
    try {
        const { text } = req.body ? req.body : ''
        const  img  = req.files ? req.files.img : null
        const userId = req.userId;
        console.log({img})
        let postImageName

        const user = await User.findById(userId);
        
        if(!user) 
            return res.status(400).json({message: "User not found"})

        if(!text && !img) 
            return res.status(400).json({message: "Post must have text or image"})     
        
        if(img){
            try {
                const result = await cloudinary.uploader.upload(img.tempFilePath, {
                    folder: 'post_images'
                });

                if (!result.secure_url) {
                    return res.status(400).json({ message: "Failed to upload post image" });
                }

               postImageName = result.secure_url;

            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Post Image upload failed", error: uploadError.message });
            }
        }

        const post = {
            user: userId,
            text: text || '',
            img: postImageName || ''
        }

        const postCreated = await Post.create(post)
        if(!createPost) return res.status(400).json({message: "Unable to create the post"})

        res.status(200).json({post})
            
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const likeUnlikePost = async(req, res) => {
    try {
        const userId = req.userId;
        const {id: postId} = req.params

        const post = await Post.findById(postId)
        if(!post) return res.status(400).json({message: "post not found"})

        const like = post.likes.includes(userId) 
        
        const notification = {
            from: userId,
            to: post.user,
            type: notificationTypes.LIKE
        }
        console.log(userId, postId, notification)

        if(like){
            await Post.findByIdAndUpdate(postId, { $pull: {likes: userId} })
            await User.findByIdAndUpdate(userId, { $pull: {likedPosts: postId} })
        }
        else{
            await Post.findByIdAndUpdate(postId, { $push: {likes: userId} })
            await User.findByIdAndUpdate(userId, { $push: {likedPosts: postId} })
        }
        // create a notification when the user like the post
        !like && await Notification.create(notification)


        res.status(200).json(
            like ? 
                `you dislike the post ${postId}` : 
                `you like the post ${postId}`
        )
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const commentPost = async(req, res) => {
    try {
        let userId = req.userId
        const { id: postId } = req.params
        const { text } = req.body
        
        if(!postId) return res.status(400).json({message: "post id not provided"})

        const post = await Post.findById(postId)
        if(!post) return res.status(400).json({message: "no such post to comment on"})

        if(!text) return res.status(400).json({message: "text is required to comment the post"})    
        console.log({userId, postId, text})
        const comment = { text, user: userId }  
        
        post.comments.push(comment)
        await post.save()

/*         const postCommented = await Post.findByIdAndUpdate(postId, { $push: { comments: comment } })
        
        if(!postCommented) return res.status(400).json({message: "Unable to add the comment"}) */

        res.status(200).json(`comment added to the post: ${postId}`)

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const deletePost = async(req, res) => {
    try {
        const { postId } = req.params
        if( !postId ) return res.status(400).json({message: "post id is required"})

        const post = await Post.findById(postId)

        if(!post)
            return res.status(400).json({message: "no such post to delete"})

        if(post.img){
            // get the image name stored on cloudinary
            const publicId = post.img.split('/').pop().split('.')[0];
            try {
                const deletionResult = await cloudinary.uploader.destroy(`post_images/${publicId}`, {
                    invalidate: true,
                    resource_type: "image"
                });
                console.log('deleting existing profile image processing ... ', publicId);
                // Check the deletion result
                if (deletionResult.result === 'ok') {
                    console.log('Image successfully deleted from Cloudinary');
                } else if (deletionResult.result === 'not found') {
                    console.log('Image not found in Cloudinary - might have been deleted already');
                } else {
                    console.log('Unexpected deletion result:', deletionResult);
                }
            } catch (error) {
                console.error('Error deleting existing image:', {
                        message: error.message, 
                        code: error.http_code,
                        name: error.name,
                        publicId
                });
            }
        }

        const deletedPost = await Post.findByIdAndDelete(postId)
        
        if(!deletedPost)
            return res.status(400).json({message: "Unable to delete the post"})

        res.status(200).json(`post ${postId} deleted successfully`)
        
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const getAllPosts = async(req, res) => {
    try {
        const posts = await Post.find().populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        }).sort({createdAt: -1});
        
        if(!posts) return res.status({message: 'no posts found'})

        res.status(200).json({posts: posts ? posts : []})
    } catch (error) {
        return res.status(500).json({message: "Internal Server error"})
    }
}

export const getPost = async(req, res) => {
    try {
        const { postId } = req.params
        const post = await Post.findById(postId).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        }).sort({createdAt: -1});
        
        if(!post) return res.status({message: 'no such post'})

        res.status(200).json({post: post ? post : []})
    } catch (error) {
        return res.status(500).json({message: "Internal Server error"})
    }
}

export const getFollowingPosts = async(req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId);

        const followingPosts = await Post.find({user: { $in: user.following } })
            .sort({createdAt: -1}).populate({
                path: "user",
                select: "-password"
            }).populate({
                path: "comments.user",
                select: "-password"
            })

        res.status(200).json({posts: followingPosts ? followingPosts : []})


    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const getUserPosts = async(req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOne({username})

        if(!user) 
            return res.status(400).json({message: "user not found"})

        const posts = await Post.find({ user: user._id })
            .sort({createdAt: -1}).populate({
                path: "user",
                select: "-password"
            }).populate({
                path: "comments.user",
                select: "-password"
            })

        res.status(200).json({posts: posts ? posts : []})
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}
