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
        if (experiencesShared >= 10) badge = 'verified';
        else if (experiencesShared >= 3) badge = 'contributor';

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
        res.status(200).json(user.healthProfile || {});
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

        user.healthProfile = {
            ...user.healthProfile,
            ...(ageGroup !== undefined && { ageGroup }),
            ...(biologicalSex !== undefined && { biologicalSex }),
            ...(chronicConditions !== undefined && { chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : user.healthProfile?.chronicConditions }),
            ...(allergies !== undefined && { allergies: Array.isArray(allergies) ? allergies : user.healthProfile?.allergies }),
            ...(pastSurgeries !== undefined && { pastSurgeries: Array.isArray(pastSurgeries) ? pastSurgeries : user.healthProfile?.pastSurgeries }),
            ...(lifestyleIndicators !== undefined && { lifestyleIndicators: Array.isArray(lifestyleIndicators) ? lifestyleIndicators : user.healthProfile?.lifestyleIndicators }),
            ...(aiPersonalizationEnabled !== undefined && { aiPersonalizationEnabled })
        };

        if (chronicConditions && Array.isArray(chronicConditions)) user.healthProfile.chronicConditions = chronicConditions;
        if (allergies && Array.isArray(allergies)) user.healthProfile.allergies = allergies;
        if (pastSurgeries && Array.isArray(pastSurgeries)) user.healthProfile.pastSurgeries = pastSurgeries;
        if (lifestyleIndicators && Array.isArray(lifestyleIndicators)) user.healthProfile.lifestyleIndicators = lifestyleIndicators;

        await user.save();
        res.status(200).json(user.healthProfile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
