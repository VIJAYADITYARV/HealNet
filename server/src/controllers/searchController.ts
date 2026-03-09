import { Request, Response } from 'express';
import Experience from '../models/Experience.js';
import { generateAIResponse } from '../utils/aiService.js';

// @desc    Search experiences
// @route   GET /api/search
// @access  Public
export const searchExperiences = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, condition, hospital, outcome, sort, city, treatment, minHelpful, costRange, aiSummary } = req.query;

        let query: any = {};

        // Advanced Search Filters
        if (city) query.city = { $regex: city, $options: 'i' };
        if (treatment) query.treatment = { $regex: treatment, $options: 'i' };
        if (minHelpful) query.helpfulCount = { $gte: parseInt(minHelpful as string) };
        if (costRange) query.costRange = costRange;

        // Text Search
        if (q) {
            query.$or = [
                { condition: { $regex: q as string, $options: 'i' } },
                { description: { $regex: q as string, $options: 'i' } },
                { treatment: { $regex: q as string, $options: 'i' } }
            ];
        }

        // Filters
        if (condition) {
            query.condition = { $regex: condition, $options: 'i' };
        }
        if (hospital) {
            query.hospital = { $regex: hospital, $options: 'i' };
        }
        if (outcome) {
            query.outcome = outcome;
        }

        // Sorting
        let sortOption: any = { createdAt: -1 };
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'helpful') {
            sortOption = { helpfulCount: -1 };
        }

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const total = await Experience.countDocuments(query);
        const experiences = await Experience.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name isAnonymous');

        const sanitizedExperiences = experiences.map((exp: any) => {
            const expObj = exp.toObject();
            if (expObj.isAnonymous || (expObj.userId && expObj.userId.isAnonymous)) {
                expObj.userId = { _id: null, name: 'Anonymous Patient', isAnonymous: true };
            }
            return expObj;
        });

        // AI INSIGHT GENERATION
        let aiInsight = null;
        if (aiSummary === 'true' && sanitizedExperiences.length > 0) {
            const context = sanitizedExperiences.slice(0, 5).map(e => ({
                cond: e.condition,
                hosp: e.hospital,
                out: e.outcome,
                txt: e.description?.substring(0, 100)
            }));

            const prompt = `
                Analyze these search results for "${q || condition || 'medical experiences'}":
                ${JSON.stringify(context)}
                
                Provide a 2-sentence summary of the general sentiment and common outcomes found in these specific cases. 
                Keep it helpful and analytical. Mention the hospital or treatment if a pattern emerges.
            `;
            aiInsight = await generateAIResponse(prompt);
        }

        res.status(200).json({
            results: sanitizedExperiences,
            aiInsight,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
