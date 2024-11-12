import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { commentPost, createPost, deletePost, getAllPosts, getFollowingPosts, getPost, getUserPosts, likeUnlikePost } 
from '../controllers/postController.js'

const postRouter = express.Router()

postRouter.get('/getAllPosts', getAllPosts)
postRouter.get('/getPost/:postId', getPost)
postRouter.get('/getFollowingPosts', protectRoute, getFollowingPosts)
// useful when searching a user
postRouter.get('/getUserPosts/:username', protectRoute, getUserPosts)
postRouter.post('/create', protectRoute, createPost)
postRouter.post('/like/:id', protectRoute, likeUnlikePost)
postRouter.post('/comment/:id', protectRoute, commentPost)
postRouter.delete('/delete/:postId', protectRoute, deletePost)

export default postRouter