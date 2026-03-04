import { Request, Response } from 'express';
import axios from 'axios';
import Experience from '../models/Experience.js';
import SymptomQuery from '../models/SymptomQuery.js';
import cache from '../utils/cache.js';
import { sanitizeExperiences } from '../utils/sanitizer.js';

// @desc    Analyze symptoms and find similar cases
// @route   POST /api/query
// @access  Public
export const analyzeSymptoms = async (req: Request, res: Response): Promise<void> => {
    try {
        const { symptoms } = req.body;

        if (!symptoms) {
            res.status(400).json({ message: 'Symptoms are required' });
            return;
        }

        // Check Cache
        const cacheKey = `query_${symptoms.toLowerCase().trim()}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
            return;
        }

        // 1. Get similar experiences from AI Service
        let similarExperienceIds: string[] = [];
        try {
            const aiResponse = await axios.post('http://localhost:8000/search', {
                text: symptoms,
                top_k: 5
            });
            similarExperienceIds = aiResponse.data.results.map((r: any) => r.experience_id);
        } catch (error) {
            console.error('AI Service Search Error:', error);
        }

        // 2. Fetch full experience details from MongoDB
        const experiences = await Experience.find({
            _id: { $in: similarExperienceIds }
        }).populate('userId', 'name isAnonymous');

        const similarCases = sanitizeExperiences(experiences);

        // 3. Aggregate Stats
        const total = similarCases.length;
        const successCount = similarCases.filter(c => c.outcome === 'success').length;
        const successRate = total > 0 ? (successCount / total) * 100 : 0;

        const hospitals = [...new Set(similarCases.map(c => c.hospital))];

        // 4. Get AI Summary
        let aiSummary = '';
        try {
            const summaryResponse = await axios.post('http://localhost:8000/summarize', {
                text: symptoms
            });
            aiSummary = summaryResponse.data.summary;
        } catch (error) {
            console.error('AI Service Summary Error:', error);
            aiSummary = 'AI summary unavailable at the moment.';
        }

        const responseData = {
            similarCases,
            stats: {
                totalCases: total,
                successRate: Math.round(successRate),
                topHospitals: hospitals.slice(0, 3)
            },
            aiSummary
        };

        // Save Query Stats for Reports
        await SymptomQuery.create({
            queryText: symptoms,
            matchCount: total
        });

        // Save to Cache
        cache.set(cacheKey, responseData);

        res.status(200).json(responseData);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
