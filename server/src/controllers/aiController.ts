import { Request, Response } from 'express';
import axios from 'axios';
import Experience from '../models/Experience.js';
import QueryLog from '../models/QueryLog.js';
import User from '../models/User.js';
import { sanitizeExperiences } from '../utils/sanitizer.js';

export const analyzeSymptomsWithAI = async (req: any, res: Response): Promise<void> => {
    try {
        const { symptomText, duration, severity, bodyArea, location, userProfileContext } = req.body;

        if (!symptomText) {
            res.status(400).json({ message: 'symptomText is required' });
            return;
        }

        // 1. Generate Embedding and Similarity Search (MOCK or real depending on Python service)
        let similarExperienceIds: string[] = [];
        try {
            const aiResponse = await axios.post('http://localhost:8000/search', {
                text: symptomText,
                top_k: 10
            });
            similarExperienceIds = aiResponse.data.results.map((r: any) => r.experience_id);
        } catch (error) {
            console.error('AI Service Search Error:', error);
        }

        const matchQuery: any = { _id: { $in: similarExperienceIds } };

        // Simple mock personalization: If user Profile provided context, maybe fetch experiences corresponding to context?
        // We will just fetch the experiences and re-rank if context is applied.
        const rawCases = await Experience.find(matchQuery).populate('userId', 'name isAnonymous');
        let similarCases = sanitizeExperiences(rawCases);

        if (userProfileContext?.aiPersonalizationEnabled) {
            // Boost matching conditions based on age/sex
            similarCases = similarCases.sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;
                // mock boost
                return scoreB - scoreA; // we just return as is if no real logic is present
            });
        }

        const conditionsMap: Record<string, number> = {};
        const successMap: Record<string, { total: number; success: number }> = {};
        const hospitalsMap: Record<string, number> = {};
        let totalRecoveryDays = 0;
        let recoveryCount = 0;

        similarCases.forEach(c => {
            const conditionName = c.condition || 'Unknown';
            conditionsMap[conditionName] = (conditionsMap[conditionName] || 0) + 1;

            const treatmentName = c.treatment || 'Unknown';
            if (!successMap[treatmentName]) {
                successMap[treatmentName] = { total: 0, success: 0 };
            }
            successMap[treatmentName].total += 1;
            if (c.outcome === 'success' || c.outcome === 'improvement') {
                successMap[treatmentName].success += 1;
            }

            const daysMatch = c.recoveryTime && typeof c.recoveryTime === 'string' ? c.recoveryTime.match(/(\d+)/) : null;
            if (daysMatch && daysMatch[1]) {
                totalRecoveryDays += parseInt(daysMatch[1], 10);
                recoveryCount += 1;
            }

            const hospitalName = c.hospital || 'Unknown';
            hospitalsMap[hospitalName] = (hospitalsMap[hospitalName] || 0) + 1;
        });

        const matchedConditions = Object.entries(conditionsMap)
            .sort((a, b) => b[1] - a[1])
            .map(e => ({ condition: e[0], matchCount: e[1], confidence: Math.round((e[1] / similarCases.length) * 100) || 0 }));

        const hospitalRecommendations = Object.entries(hospitalsMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(e => ({ name: e[0], matchCount: e[1] }));

        const treatmentInsights = Object.entries(successMap)
            .map(e => ({
                treatment: e[0],
                successRate: Math.round((e[1].success / e[1].total) * 100) || 0,
                casesAnalyzed: e[1].total
            }))
            .sort((a, b) => b.successRate - a.successRate);

        const recoveryEstimate = recoveryCount > 0 ? Math.round(totalRecoveryDays / recoveryCount) : 0;

        // Structured result for summary
        let aiSummary = '';
        try {
            const summaryResponse = await axios.post('http://localhost:8000/summarize', {
                text: `Patient has ${symptomText}. We found ${similarCases.length} similar cases. Top condition is ${matchedConditions[0]?.condition || 'Unknown'}.`
            });
            aiSummary = summaryResponse.data.summary;
        } catch (error) {
            console.error('AI Service Summary Error:', error);
            aiSummary = 'AI summary unavailable. Based on similar experiences, it is recommended to consult a doctor for further evaluation.';
        }

        const responseData = {
            matchedConditions,
            similarExperiences: similarCases.slice(0, 5),
            hospitalRecommendations,
            treatmentInsights,
            recoveryEstimate: `${recoveryEstimate} days avg`,
            summary: aiSummary
        };

        const qLog = new QueryLog({
            userId: req.user?.id || req.body.userId || '65123abcd123456789012345',
            inputText: symptomText,
            filters: { duration, severity, bodyArea, location },
            matchCount: similarCases.length
        });
        await qLog.save();

        res.status(200).json(responseData);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI Personalized Recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getAIRecommendations = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.healthProfile || !user.healthProfile.aiPersonalizationEnabled) {
            res.status(400).json({ message: 'AI Personalization is not enabled or profile incomplete' });
            return;
        }

        const profile = user.healthProfile;

        // Find experiences matching chronic conditions or allergies
        let queryConditions = [];
        if (profile.chronicConditions && profile.chronicConditions.length > 0) {
            queryConditions.push({ condition: { $in: profile.chronicConditions.map(c => new RegExp(c, 'i')) } });
        }
        if (profile.allergies && profile.allergies.length > 0) {
            queryConditions.push({ symptoms: { $in: profile.allergies.map(a => new RegExp(a, 'i')) } });
        }

        let recommendedExperiences: any[] = [];
        if (queryConditions.length > 0) {
            const rawRecs = await Experience.find({ $or: queryConditions })
                .populate('userId', 'name isAnonymous')
                .sort({ helpfulCount: -1 })
                .limit(5);
            recommendedExperiences = sanitizeExperiences(rawRecs);
        } else {
            // fallback
            const rawRecs = await Experience.find()
                .populate('userId', 'name isAnonymous')
                .sort({ helpfulCount: -1 })
                .limit(5);
            recommendedExperiences = sanitizeExperiences(rawRecs);
        }

        let aiSummary = '';
        try {
            const summaryResponse = await axios.post('http://localhost:8000/summarize', {
                text: `Patient is ${profile.ageGroup} ${profile.biologicalSex} with conditions: ${(profile.chronicConditions || []).join(', ')}. Provide a 2 sentence proactive health tip.`
            });
            aiSummary = summaryResponse.data.summary;
        } catch (error) {
            aiSummary = 'Stay hydrated and maintain regular checkups.';
        }

        res.status(200).json({
            personalizedTips: aiSummary,
            recommendedReading: recommendedExperiences
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
