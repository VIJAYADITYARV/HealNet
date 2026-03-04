import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Experience from '../models/Experience.js';

// @desc    Get public profile by username
// @route   GET /api/profile/:username
// @access  Public
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const identifier = req.params.username as string;
        const query = mongoose.Types.ObjectId.isValid(identifier)
            ? { _id: identifier }
            : { username: identifier };

        const user = await User.findOne(query).select('-password -healthProfile');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Fetch user's public experiences
        const experiences = await Experience.find({
            userId: user._id,
            visibility: 'PUBLIC'
        })
            .populate('userId', 'name username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            user,
            experiences
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile settings
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { username, bio, profilePicture, location, contactEmail, contactPhone, allowMessages } = req.body;

        // check if username is taken
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                res.status(400).json({ message: 'Username is already taken' });
                return;
            }
        }

        if (username !== undefined) user.username = username;
        if (bio !== undefined) user.bio = bio;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (location !== undefined) user.location = location;
        if (contactEmail !== undefined) user.contactEmail = contactEmail;
        if (contactPhone !== undefined) user.contactPhone = contactPhone;
        if (allowMessages !== undefined) user.allowMessages = allowMessages;

        await user.save();
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
