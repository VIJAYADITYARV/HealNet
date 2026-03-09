import { Request, Response } from 'express';
import User from '../models/User.js';
import Experience from '../models/Experience.js';
import HelpfulMark from '../models/HelpfulMark.js';

// @desc    Get current user profile with stats
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const experiencesShared = await Experience.countDocuments({ userId });
        const insightsExplored = await HelpfulMark.countDocuments({ userId });
        const communityImpactAgg = await Experience.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, total: { $sum: '$helpfulCount' } } }
        ]);
        const communityImpact = communityImpactAgg[0]?.total || 0;

        // Auto-update badge
        let badge: 'new' | 'contributor' | 'verified' = 'new';
        if (user.credentialPoints >= 100 || experiencesShared >= 10) badge = 'verified';
        else if (user.credentialPoints >= 30 || experiencesShared >= 3) badge = 'contributor';

        if (user.contributorBadge !== badge) {
            await User.findByIdAndUpdate(userId, { contributorBadge: badge });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAnonymous: user.isAnonymous,
            badge,
            credentialPoints: user.credentialPoints,
            stats: {
                experiencesShared,
                insightsExplored,
                communityImpact
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle anonymous mode
// @route   PATCH /api/users/anonymous-mode
// @access  Private
export const toggleAnonymousMode = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.isAnonymous = !user.isAnonymous;
        await user.save();
        res.status(200).json({ isAnonymous: user.isAnonymous });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user health profile
// @route   GET /api/users/health-profile
// @access  Private
export const getHealthProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            profile: user.healthProfile || {},
            logs: user.healthLogs || []
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user health profile
// @route   PATCH /api/users/health-profile
// @access  Private
export const updateHealthProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { ageGroup, biologicalSex, chronicConditions, allergies, pastSurgeries, lifestyleIndicators, aiPersonalizationEnabled } = req.body;

        if (!user.healthProfile) {
            user.healthProfile = {};
        }

        if (ageGroup !== undefined) user.healthProfile.ageGroup = ageGroup;
        if (biologicalSex !== undefined) user.healthProfile.biologicalSex = biologicalSex;
        if (chronicConditions !== undefined && Array.isArray(chronicConditions)) user.healthProfile.chronicConditions = chronicConditions;
        if (allergies !== undefined && Array.isArray(allergies)) user.healthProfile.allergies = allergies;
        if (pastSurgeries !== undefined && Array.isArray(pastSurgeries)) user.healthProfile.pastSurgeries = pastSurgeries;
        if (lifestyleIndicators !== undefined && Array.isArray(lifestyleIndicators)) user.healthProfile.lifestyleIndicators = lifestyleIndicators;
        if (aiPersonalizationEnabled !== undefined) user.healthProfile.aiPersonalizationEnabled = aiPersonalizationEnabled;

        await user.save();
        res.status(200).json(user.healthProfile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a health log record
// @route   POST /api/users/health-logs
// @access  Private
export const createHealthLog = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.healthLogs.push(req.body);
        await user.save();
        res.status(201).json(user.healthLogs[user.healthLogs.length - 1]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a health log record
// @route   PATCH /api/users/health-logs/:id
// @access  Private
export const updateHealthLog = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const logIndex = user.healthLogs.findIndex((l: any) => l._id.toString() === req.params.id);
        if (logIndex === -1) {
            res.status(404).json({ message: 'Log not found' });
            return;
        }
        user.healthLogs[logIndex] = { ...user.healthLogs[logIndex], ...req.body };
        await user.save();
        res.status(200).json(user.healthLogs[logIndex]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a health log record
// @route   DELETE /api/users/health-logs/:id
// @access  Private
export const deleteHealthLog = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.healthLogs = user.healthLogs.filter((l: any) => l._id.toString() !== req.params.id);
        await user.save();
        res.status(200).json({ message: 'Log removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublicEmergencyInfo = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('name phone healthProfile email');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({ message: 'Invalid ID or user not found' });
    }
};
