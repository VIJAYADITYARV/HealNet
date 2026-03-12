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

        // 1. Semantic Search / Fallback matching
        // Since localhost:8000 might not be running, we use a fallback text search
        const keywords = symptoms.split(' ').filter((s: string) => s.length > 3);
        const experiences = await Experience.find({
            $or: [
                { condition: { $regex: symptoms, $options: 'i' } },
                { description: { $regex: symptoms, $options: 'i' } },
                { symptoms: { $in: keywords.map((k: string) => new RegExp(k, 'i')) } }
            ]
        }).populate('userId', 'name isAnonymous').limit(10);

        const similarCases = sanitizeExperiences(experiences);

        // 2. Get AI Summary from Gemini
        let aiSummary = '';
        try {
            const { generateAIResponse } = await import('../utils/aiService.js');
            const aiPrompt = `
                Analyze these symptoms reported by a patient: "${symptoms}".
                Based on our community data, we found ${similarCases.length} similar cases.
                Provide a 2-sentence empathetic summary of what these symptoms might indicate and what treatments patients typically reported.
                Use "Our community data suggests..." and avoid direct medical diagnosis.
            `;
            aiSummary = await generateAIResponse(aiPrompt);
        } catch (error) {
            console.error('Gemini Summary Error:', error);
            aiSummary = 'Our community data is currently being analyzed. Please consult a professional for immediate concerns.';
        }

        // 3. Aggregate Stats
        const total = similarCases.length;
        const successCount = similarCases.filter(c => c.outcome === 'success').length;
        const successRate = total > 0 ? (successCount / total) * 100 : 0;
        const hospitals = [...new Set(similarCases.map(c => c.hospital))];

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
