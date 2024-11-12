import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { deleteAllNotifications, getAllNotifications } from '../controllers/notificationController.js'

const notificationRouter = express.Router()

notificationRouter.get('/', protectRoute, getAllNotifications)
notificationRouter.delete('/', protectRoute, deleteAllNotifications)

export default notificationRouter