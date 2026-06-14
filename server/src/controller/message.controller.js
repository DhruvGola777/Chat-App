import userModel from "../models/user.model.js";
import messageModel from '../models/message.model.js'
import cloudinary from "../config/cloudinary.js";
import { io, userSocketMap } from '../../server.js';

export async function getUserForSidebar(req, res) {
    try {
        const  userId  = req.user._id;
        const filteredUsers = await userModel.find({ _id: { $ne: userId } }).select("-password");
        console.log(`Fetched ${filteredUsers.length} users for sidebar for user ${userId}`);

        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await messageModel.find({ senderId: user._id, receiverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        return res.status(200).json({ success: true ,users:filteredUsers,unseenMessages})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ success: false, message: error.message })
    }
}
export async function getMessages(req, res) {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        const messages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })
        await messageModel.updateMany({ senderId: selectedUserId, receiverId:myId }, { seen: true });
        return res.status(200).json({ success: true, messages })
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ success: false, message: error.message })
    }
}
export async function markMessagesAsSeen(req, res) {
    try {
        const { id } = req.params;
        await messageModel.findByIdAndUpdate(id, { seen: true })
        return res.status(200).json({ success: true })
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ success: false, message: error.message })
    }
}
export async function sendMessages(req, res) {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage =await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })
        const receiverSocketId = userSocketMap[receiverId]
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        return res.status(201).json({ success: true, newMessage });

    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ success: false, message: error.message })
    }
}