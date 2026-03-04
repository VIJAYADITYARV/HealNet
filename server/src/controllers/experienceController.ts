import { Request, Response } from 'express';
import Experience from '../models/Experience.js';
import User from '../models/User.js';
import HelpfulMark from '../models/HelpfulMark.js';
import axios from 'axios';
import { sanitizeExperience, sanitizeExperiences } from '../utils/sanitizer.js';

// @desc    Get all experiences (feed) with filters
// @route   GET /api/experiences/feed
// @access  Public
export const getExperiencesFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (req.query.condition) filter.condition = { $regex: req.query.condition as string, $options: 'i' };
        if (req.query.hospital) filter.hospital = { $regex: req.query.hospital as string, $options: 'i' };
        if (req.query.outcome) filter.outcome = req.query.outcome;
        if (req.query.city) filter.city = { $regex: req.query.city as string, $options: 'i' };

        const total = await Experience.countDocuments(filter);
        const experiences = await Experience.find(filter)
            .populate('userId', 'name isAnonymous')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const sanitizedExperiences = sanitizeExperiences(experiences);

        res.status(200).json({
            experiences: sanitizedExperiences,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create new experience
// @route   POST /api/experiences
// @access  Private
export const createExperience = async (req: any, res: Response): Promise<void> => {
    try {
        const { hospital, condition, symptoms, treatment, outcome, recoveryTime, description, city, costRange, isAnonymous } = req.body;

        const experience = await Experience.create({
            userId: req.user.id,
            hospital,
            condition,
            symptoms,
            treatment,
            outcome,
            recoveryTime,
            description,
            city,
            costRange,
            isAnonymous: isAnonymous || false
        });

        // Update user badge and points based on experience count
        await User.findByIdAndUpdate(req.user.id, { $inc: { credentialPoints: 10 } });
        const count = await Experience.countDocuments({ userId: req.user.id });
        let badge = 'new';
        if (count >= 10) badge = 'verified';
        else if (count >= 3) badge = 'contributor';
        await User.findByIdAndUpdate(req.user.id, { contributorBadge: badge });

        // Push to AI Service for vector encoding and semantic search indexing
        try {
            const indexText = `Condition: ${condition}. Symptoms: ${symptoms.join(', ')}. Treatment: ${treatment}. Description: ${description || ''}`;
            await axios.post('http://localhost:8000/index', {
                text: indexText,
                experience_id: experience._id.toString()
            });
        } catch (aiError) {
            console.error('[AI Indexing Error] Could not index experience:', aiError);
            // Optionally could store a flag on experience saying AI indexing failed
        }

        res.status(201).json(experience);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all experiences (paginated)
// @route   GET /api/experiences
// @access  Public
export const getExperiences = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const total = await Experience.countDocuments();
        const experiences = await Experience.find()
            .populate('userId', 'name isAnonymous')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const sanitizedExperiences = sanitizeExperiences(experiences);

        res.status(200).json({
            experiences: sanitizedExperiences,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get experience by ID
// @route   GET /api/experiences/:id
// @access  Public
export const getExperienceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const experience = await Experience.findById(req.params.id).populate('userId', 'name isAnonymous');
        if (!experience) {
            res.status(404).json({ message: 'Experience not found' });
            return;
        }
        const sanitizedExperience = sanitizeExperience(experience);
        res.status(200).json(sanitizedExperience);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Toggle helpful on an experience
// @route   POST /api/experiences/:id/helpful
// @access  Private
export const toggleHelpful = async (req: any, res: Response): Promise<void> => {
    try {
        const experienceId = req.params.id;
        const userId = req.user.id;

        const experience = await Experience.findById(experienceId);
        if (!experience) {
            res.status(404).json({ message: 'Experience not found' });
            return;
        }

        const existing = await HelpfulMark.findOne({ userId, experienceId });

        if (existing) {
            // Remove helpful
            await HelpfulMark.deleteOne({ userId, experienceId });
            await Experience.findByIdAndUpdate(experienceId, { $inc: { helpfulCount: -1 } });
            await User.findByIdAndUpdate(experience.userId, { $inc: { credentialPoints: -2 } });
            res.status(200).json({ helpful: false });
        } else {
            // Add helpful
            await HelpfulMark.create({ userId, experienceId });
            await Experience.findByIdAndUpdate(experienceId, { $inc: { helpfulCount: 1 } });
            await User.findByIdAndUpdate(experience.userId, { $inc: { credentialPoints: 2 } });
            res.status(200).json({ helpful: true });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get current user's experiences
// @route   GET /api/experiences/me
// @access  Private
export const getMyExperiences = async (req: any, res: Response): Promise<void> => {
    try {
        const experiences = await Experience.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json(experiences);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get community experiences feed
// @route   GET /api/experiences/community
// @access  Public
export const getCommunityFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const total = await Experience.countDocuments();
        const experiences = await Experience.find()
            .populate('userId', 'name isAnonymous')
            .sort({ helpfulCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const sanitizedExperiences = sanitizeExperiences(experiences);

        res.status(200).json({ experiences: sanitizedExperiences, page, pages: Math.ceil(total / limit), total });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update experience by ID
// @route   PUT /api/experiences/:id
// @access  Private
export const updateExperience = async (req: any, res: Response): Promise<void> => {
    try {
        const experience = await Experience.findById(req.params.id);
        if (!experience) {
            res.status(404).json({ message: 'Experience not found' });
            return;
        }

        // Make sure user owns the experience
        if (experience.userId.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const updatedExperience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedExperience);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete experience by ID
// @route   DELETE /api/experiences/:id
// @access  Private
export const deleteExperience = async (req: any, res: Response): Promise<void> => {
    try {
        const experience = await Experience.findById(req.params.id);
        if (!experience) {
            res.status(404).json({ message: 'Experience not found' });
            return;
        }

        // Make sure user owns the experience
        if (experience.userId.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await experience.deleteOne();

        // Remove helpful marks related to this experience
        await HelpfulMark.deleteMany({ experienceId: req.params.id });

        res.status(200).json({ id: req.params.id });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
