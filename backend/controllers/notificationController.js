import mongoose from "mongoose"
import Notification from "../models/Notification.js"

export const getAllNotifications = async(req, res) => {
    try {
        const userId = req.userId
        const notifications = await Notification.find({to: userId})
            .sort({createdAt: -1})
            .populate({
                path: "from",
                select: "-_id username profileImage"
            }).
            populate({
                path: "to",
                select: "-_id username profileImage"
            })

        await Notification.updateMany({ to: userId }, { read: true })

        res.status(200).json({notifications})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteAllNotifications = async(req, res) => {
    try {
        const userId = req.userId
		const notificationDeletion = await Notification.deleteMany({ to: userId });
        if(!notificationDeletion) return res.status(400).json({message: 'Unable to delete notification'})

		res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error: "+error.message})
    }
}