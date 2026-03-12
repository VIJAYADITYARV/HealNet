import mongoose from 'mongoose';
import { Response } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: any, res: Response): Promise<void> => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (senderId === receiverId) {
            res.status(400).json({ message: 'You cannot message yourself' });
            return;
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            res.status(404).json({ message: 'Receiver not found' });
            return;
        }

        // Check if receiver allows messages
        if (receiver.allowMessages === false) {
            res.status(403).json({ message: 'This user is not accepting messages' });
            return;
        }

        const message = await Message.create({
            senderId,
            receiverId,
            content
        });

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
export const getConversation = async (req: any, res: Response): Promise<void> => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mark unread messages as read
        await Message.updateMany(
            { senderId: otherUserId, receiverId: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations/list
// @access  Private
export const getConversationsList = async (req: any, res: Response): Promise<void> => {
    try {
        const userIdStr = (req.user._id || req.user.id).toString();
        const userId = new mongoose.Types.ObjectId(userIdStr);

        console.log(`[Messages] Fetching conversations for user: ${userIdStr}`);

        const latestMessages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMsgId: { $first: "$_id" }
                }
            }
        ]);

        console.log(`[Messages] Found ${latestMessages.length} unique conversation partners`);

        if (latestMessages.length === 0) {
            res.status(200).json([]);
            return;
        }

        const msgIds = latestMessages.map(m => m.lastMsgId);
        const conversations = await Message.find({ _id: { $in: msgIds } })
            .populate('senderId', 'name username profilePicture')
            .populate('receiverId', 'name username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json(conversations);
    } catch (error: any) {
        console.error("Get Conv List Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Suggested Users to Message
 */
export const getSuggestedUsers = async (req: any, res: Response): Promise<void> => {
    try {
        // Find users that are not the current user
        const currentUserId = req.user.id;
        const suggestions = await User.find({ _id: { $ne: currentUserId } })
            .select('name username profilePicture')
            .limit(10);

        res.status(200).json(suggestions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
