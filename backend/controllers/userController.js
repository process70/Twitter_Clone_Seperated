import { Types } from "mongoose"
import Notification from "../models/Notification.js"
import User from "../models/User.js"
import { notificationTypes } from "../notificationsTypes.js"

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/Post.js";
// Make sure you have the MongoDB driver imported

export const getCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        
        if(!user) return res.status(400).json({message: 'User Not Found'})
        
        res.status(200).json({user})

    } catch (error) {
        console.log(error)
        return res.status(500).json({messsage: "Internal Server Error"})
    }
}

export const getUserProfile = async(req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({username}).select("-password")
        
        if(!user) return res.status(404).json({message: "User Not Found"})
        res.status(200).json({user})    

    } catch (error) {
        return res.status(500).json({messsage: "Internal Server Error, User Profile Request Not Handled"})
    }
}

export const followUnFollowUser = async(req, res) => {
    try {
        const { id } = req.params // user id to follow
        if(id === req.userId) return res.status(400).json({message: "you can't follow yourself"})
        
        const currentUser = await User.findById(req.userId) // YOU
        const userToFollow = await User.findById(id)
    
        if(!currentUser || !userToFollow)
                return res.status(401).json({message: "users not found"})       
            
        const isFollow = userToFollow.followers.includes(req.userId)
        console.log({isFollow})
    
        if(isFollow){
            // unFollow the cuurentUser
            await User.findByIdAndUpdate(id, { $pull: {followers: req.userId} })
            await User.findByIdAndUpdate(req.userId, { $pull: {following: id} }) 
        }
        else{ // follow the currentUser
            // add current user to the followers to the user you want to follow
            await User.findByIdAndUpdate(id, { $push: {followers: req.userId} })
            
            // add the want you want to follow to the following of the current user
    
            await User.findByIdAndUpdate(req.userId, { $push: {following: id} })
    
            const notification = {
                from: req.userId,
                to: id,
                type: notificationTypes.FOLLOW
            }
    
            const createNotification = await Notification.create(notification)
            
            if(!createNotification) 
                return res.status(400).json({message: "Unable to create a new notification"})
        }
        
        
    
        const message = isFollow ? "UnFollowing" : "Following"
    
        res.status(200).json({message: isFollow ? "UnFollowing" : "Following", currentUser, userToFollow})

    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getSuggestedUsers = async(req, res) => {
    try {
        const getAllUsers = await User.find()
        
        if(!getAllUsers) 
            return res.status(400).json({message: "No Users"})

        const currentUserId = req.userId

/*         const getUser = await User.findById(currentUserId)
        if(!getUser) 
            return res.status(400).json({message: "User Not Found, Check Him Out"})
    
        const followers = getUser.following.map(user => {
            return user.toString()      
        })
        console.log('followers', followers)

        const followerswithCurrentUser = [ ...followers, currentUserId]
        console.log('followers with current user', followerswithCurrentUser)

        const suggestedUsers = []

        getAllUsers.map(user => {
            if(!followerswithCurrentUser.includes(user._id.toString()))
                suggestedUsers.push(user.username)
        })

        // res.status(204).json({message: "No Users to Suggest" })
        // res.status(204).json({message: "Users Suggestions", suggestedUsers})

        const result = suggestedUsers.length === 0
            ? {
                status: 204,
                message: "No Users to Suggest",
                suggestedUsers: []
            }
            : {
                status: 200,
                message: "Users Suggestions",
                suggestedUsers
            } 
        
        res.status(result.status).json({message: result.message, suggestedUsers: result.suggestedUsers}) */

        const usersFollowedByMe = await User.findById(currentUserId).select("following");
 		const users = await User.aggregate([
			{
				$match: {
                    _id: { $ne: new Types.ObjectId(currentUserId) }},
			},
			{ $sample: { size: 10 } },
		]);

		// 1,2,3,4,5,6,
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id)).slice(0, 4);

		filteredUsers.forEach((user) => (user.password = null));

		res.status(200).json({filteredUsers});
            
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const updateUser = async(req, res) => {
    const { fullName, email, username, bio, link, newPassword } = req.body;

    const userId = req.userId;
    const profileImg = req.files?.profileImg;
    const coverImg = req.files?.coverImg;
   
    let  profileImgName = "" 
    let  coverImgName = "" 

    try {
        let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
        
        let loginAgain = username !== user.username

		if (newPassword !== '') {
            // the user need to log in again
            console.log("password changed", newPassword)
            loginAgain = true
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

        if(profileImg){
           
            if (user.profileImage) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                // delete the exisitng profile image
                const publicId = user.profileImage.split('/').pop().split('.')[0];
                try {
                    const deletionResult = await cloudinary.uploader.destroy(`profile_images/${publicId}`, {
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

            try {
                // Upload new image
                const result = await cloudinary.uploader.upload(profileImg.tempFilePath, {
                    folder: 'profile_images' // Optional: organize images in folders
                });

                if (!result.secure_url) {
                    return res.status(400).json({ message: "Failed to upload profile image" });
                }

               profileImgName = result.secure_url;

            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Image profile upload failed", error: uploadError.message });
            }

        }

        if(coverImg){
           
            if (user.cover) {
                const publicId = user.cover.split("/").pop().split(".")[0]
                try {
                    const deletionResult = await cloudinary.uploader.destroy(`profile_images/${publicId}`, {
                        invalidate: true,
                        resource_type: "image"
                    });
                    console.log('deleting existing profile image processing ... ', publicId);
                    
                } catch (error) {
                    console.error('Error deleting existing image:', {
                            message: error.message, 
                            code: error.http_code,
                            name: error.name,
                            publicId
                    });
			    }
            }

            try {
                // Upload new image
                const result = await cloudinary.uploader.upload(coverImg.tempFilePath, {
                    folder: 'profile_images' // Optional: organize images in folders
                });

                if (!result.secure_url) {
                    return res.status(400).json({ message: "Failed to upload cover image" });
                }

               coverImgName = result.secure_url;

            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Image cover upload failed", error: uploadError.message });
            }
        }

        user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.cover = coverImgName || user.cover;
		user.profileImage = profileImgName || user.profileImage;
        console.log({user})
		user = await user.save();

		// password should be null in response
		user.password = null;

		res.status(200).json({user, loginAgain});

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const getLikedPosts = async(req, res) => {
    try {
        const {id: userId} = req.params
        
        const user = await User.findById(userId).populate({
            path: "likedPosts",
            populate: {
                path: "user",
                select: "-password" // Exclude password field from user data
            }
        })
        .select("likedPosts");
        
        if(!user) return res.status(400).json({message: "user not found"})

        res.status(200).json({posts: user.likedPosts})    

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error: "+error.message})
    }
}
