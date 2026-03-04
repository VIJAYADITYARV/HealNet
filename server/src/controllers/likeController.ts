import { Request, Response } from 'express';
import Like from '../models/Like.js';
import Experience from '../models/Experience.js';

// @desc    Add a like to an experience
// @route   POST /api/likes
// @access  Private
export const addLike = async (req: any, res: Response): Promise<void> => {
    try {
        const { experienceId } = req.body;
        const userId = req.user.id;

        const experience = await Experience.findById(experienceId);
        if (!experience) {
            res.status(404).json({ message: 'Experience not found' });
            return;
        }

        const existingLike = await Like.findOne({ experienceId, userId });
        if (existingLike) {
            res.status(400).json({ message: 'You have already liked this experience' });
            return;
        }

        const like = await Like.create({ experienceId, userId });

        // Increment likeCount
        await Experience.findByIdAndUpdate(experienceId, { $inc: { likeCount: 1 } });

        res.status(201).json(like);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a like
// @route   DELETE /api/likes/:experienceId
// @access  Private
export const removeLike = async (req: any, res: Response): Promise<void> => {
    try {
        const { experienceId } = req.params;
        const userId = req.user.id;

        const existingLike = await Like.findOne({ experienceId, userId });
        if (!existingLike) {
            res.status(404).json({ message: 'Like not found' });
            return;
        }

        await existingLike.deleteOne();

        // Decrement likeCount
        await Experience.findByIdAndUpdate(experienceId, { $inc: { likeCount: -1 } });

        res.status(200).json({ experienceId });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's likes
// @route   GET /api/likes
// @access  Private
export const getUserLikes = async (req: any, res: Response): Promise<void> => {
    try {
        const likes = await Like.find({ userId: req.user.id });
        res.status(200).json(likes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
