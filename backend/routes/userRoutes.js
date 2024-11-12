import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { followUnFollowUser, getCurrentUser, getLikedPosts, getSuggestedUsers, getUserProfile, updateUser } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get("/getCurrentUser", protectRoute, getCurrentUser)
// get all the posts he liked
userRouter.get("/likes/:id", protectRoute, getLikedPosts)
userRouter.get("/getSuggestedUsers", protectRoute, getSuggestedUsers)
// use /profile in case of handling queries
userRouter.get("/profile/:username", protectRoute, getUserProfile)
// Temporary route for debugging
/* userRouter.get("/profile/*", (req, res) => {
    console.log("Profile route accessed with params:", req.params);
    res.json({ message: "Profile route reached", params: req.params });
}); */

userRouter.post("/followUnFollow/:id", protectRoute, followUnFollowUser)
// userRouter.patch("/update/:username", protectRoute, updateUserProfile)

userRouter.patch("/update", protectRoute, updateUser)

export default userRouter