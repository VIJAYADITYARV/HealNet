import { Request, Response } from 'express';
import Notification from '../models/Notification.js';

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: any, res: Response): Promise<void> => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: any, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.status(200).json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: any, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
