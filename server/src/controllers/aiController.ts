import { Request, Response } from 'express';
import Experience from '../models/Experience.js';
import QueryLog from '../models/QueryLog.js';
import User from '../models/User.js';
import { sanitizeExperiences } from '../utils/sanitizer.js';
import { generateAIResponse, parseMedicalReport } from '../utils/aiService.js';

export const analyzeSymptomsWithAI = async (req: any, res: Response): Promise<void> => {
    try {
        const { symptomText, duration, severity, bodyArea, location, userProfileContext } = req.body;

        if (!symptomText) {
            res.status(400).json({ message: 'symptomText is required' });
            return;
        }

        // 1. Semantic Search Logic
        // Since we don't have a real vector DB locally without a heavy setup, 
        // we'll use a text-based search to find candidates and let Gemini analyze them if needed. 
        // For now, let's improve the text search.
        const searchKeywords = symptomText.split(' ').filter((w: string) => w.length > 3);
        const matchQuery: any = {
            $or: [
                { condition: { $regex: symptomText, $options: 'i' } },
                { description: { $regex: symptomText, $options: 'i' } },
                { symptoms: { $in: searchKeywords.map((k: string) => new RegExp(k, 'i')) } }
            ]
        };

        const rawCases = await Experience.find(matchQuery).populate('userId', 'name isAnonymous').limit(20);
        let similarCases = sanitizeExperiences(rawCases);

        // 2. Data Aggregation for AI Context
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
            .map(e => ({ condition: e[0], matchCount: e[1], confidence: Math.min(95, Math.round((e[1] / Math.max(1, similarCases.length)) * 100) + 10) }));

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

        const recoveryEstimate = recoveryCount > 0 ? Math.round(totalRecoveryDays / recoveryCount) : 14;

        // 3. ACTUAL Gemini AI Synthesis
        const aiPrompt = `
            Context: You are the "HealNet Community AI", a system that synthesizes shared patient experiences.
            Input: A user is asking about: "${symptomText}".
            Data from our Community Database:
            - We found ${similarCases.length} similar user-shared journeys.
            - Top trends in these journeys: ${matchedConditions.slice(0, 2).map(c => c.condition).join(', ')}
            - Reported successful treatments: ${treatmentInsights.slice(0, 2).map(t => t.treatment).join(', ')}
            - Average community-reported recovery: ${recoveryEstimate} days.
            
            Task: Provide a 2-3 sentence overview of these community trends. 
            Important: Frames this strictly as "what other patients in the community reported" and "trends found in shared experiences". 
            Avoid clinical diagnostic language. Focus on being empathetic and community-focused.
        `;

        const aiSummary = await generateAIResponse(aiPrompt);

        const responseData = {
            matchedConditions,
            similarExperiences: similarCases.slice(0, 5),
            hospitalRecommendations,
            treatmentInsights,
            recoveryEstimate: `${recoveryEstimate} days avg`,
            summary: aiSummary
        };

        const qLog = new QueryLog({
            userId: req.user?.id || '65123abcd123456789012345',
            inputText: symptomText,
            filters: { duration, severity, bodyArea, location },
            matchCount: similarCases.length
        });
        await qLog.save();

        res.status(200).json(responseData);
    } catch (error: any) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAIRecommendations = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.healthProfile || (!user.healthProfile.chronicConditions?.length && !user.healthProfile.ageGroup)) {
            // Provide a general tip if profile is incomplete
            const aiPrompt = `
                Context: A user has a new, empty health profile on HealNet.
                Task: Suggest a 1-sentence wellness/preventive tip to encourage them to complete their profile for personalized community insights.
                Tone: Supportive, professional, and community-driven.
            `;
            const generalTip = await generateAIResponse(aiPrompt);
            res.status(200).json({
                personalizedTips: generalTip || "Complete your Health Profile to unlock personalized community insights and wellness trends tailored for you.",
                recommendedReading: []
            });
            return;
        }

        const profile = user.healthProfile;

        const aiPrompt = `
            Context: HealNet AI Guardian providing a daily trend for a community member.
            User Profile Trends: 
            - Group: ${profile.ageGroup || 'General'}
            - Conditions: ${(profile.chronicConditions || []).join(', ') || 'Wellness focus'}
            - Allergies: ${(profile.allergies || []).join(', ') || 'None reported'}
            
            Task: Write a 1-sentence community-focused health or wellness tip based on this profile.
            Constraint: Frame it as a proactive wellness trend. Output ONLY the tip text.
        `;

        const aiTip = await generateAIResponse(aiPrompt);

        // Fetch relevant experiences
        const searchTerms = profile.chronicConditions && profile.chronicConditions.length > 0
            ? profile.chronicConditions
            : ["general health", "wellness"];

        const rawRecs = await Experience.find({
            $or: [
                { condition: { $in: searchTerms.map(c => new RegExp(c, 'i')) } },
                { description: { $regex: searchTerms[0] || '', $options: 'i' } }
            ]
        }).populate('userId', 'name isAnonymous').limit(5);

        res.status(200).json({
            personalizedTips: aiTip,
            recommendedReading: sanitizeExperiences(rawRecs)
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * OCR Medical Report Controller
 */
export const processMedicalReportOCR = async (req: any, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        // Add a specialized prompt for OCR
        const result = await parseMedicalReport(req.file.buffer, req.file.mimetype);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("OCR Controller Error:", error);
        res.status(500).json({ message: "AI failed to parse the report. Please ensure the image is clear and contains medical data." });
    }
};

/**
 * Hospital Comparison AI Advisor
 */
export const getComparisonAIInsight = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hospitalA, hospitalB, condition } = req.body;

        const aiPrompt = `
            You are a HealNet Medical Advisor. Compare these two hospitals for treating "${condition}":
            Hospital A: ${JSON.stringify(hospitalA)}
            Hospital B: ${JSON.stringify(hospitalB)}

            Based on the clinical data provided (rating, success stories, trust tier, metrics), 
            provide a 3-sentence expert recommendation on which hospital might be better for this specific condition. 
            Highlight one specific strength for each. Be professional and objective.
        `;

        const insight = await generateAIResponse(aiPrompt);
        res.status(200).json({ insight });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * AI Experience Draft Generator
 */
export const generateExperienceDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        const { condition, symptoms, treatment, outcome } = req.body;

        const aiPrompt = `
            A patient wants to share their medical journey on HealNet. 
            Condition: ${condition}
            Symptoms: ${symptoms.join(', ')}
            Treatment: ${treatment}
            Outcome: ${outcome}

            Write a warm, empathetic 2-3 sentence narrative draft that they can use as a starting point for their "Description". 
            Write it in the first person ("I experienced..."). Keep it supportive and community-focused.
        `;

        const draft = await generateAIResponse(aiPrompt);
        res.status(200).json({ draft });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * AI Chat Context Analyzer
 */
export const analyzeChatContext = async (req: any, res: Response): Promise<void> => {
    try {
        const { messages, otherUserName } = req.body;

        const aiPrompt = `
            You are a HealNet AI assistant providing private medical context for a patient's chat.
            Chat History with ${otherUserName}:
            ${messages.slice(-10).map((m: any) => `${(m.senderId?._id || m.senderId) === req.user?.id ? 'Me' : otherUserName}: ${m.content}`).join('\n')}

            Based on this conversation, provide:
            1. A 1-sentence summary of the medical topic being discussed.
            2. Two smart, empathetic questions the user could ask ${otherUserName} to gain better insights into their journey.
            
            Format your response exactly as follows:
            Summary: [text] Suggestions: [q1], [q2]
        `;

        const analysis = await generateAIResponse(aiPrompt);
        res.status(200).json({ analysis });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
/**
 * AI Community Trends Generator
 */
export const getAICommunityTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        const aiPrompt = `
            Task: Provide 2 short, impactful medical trends or wellness alerts based on general health data.
            Trend 1: Focus on a treatment seeing high community success currently.
            Trend 2: A seasonal or lifestyle health alert.
            Constraints: Each trend must be under 10 words. Mark them as Trend: [text] and Alert: [text].
            Tone: Professional, data-driven.
        `;

        const response = await generateAIResponse(aiPrompt);
        const trends = response.split('\n').filter(l => l.includes(':')).map(l => l.trim());

        res.status(200).json({
            trends: trends.length > 0 ? trends : [
                "Trend: Physiotherapy success rate up 12% in the community.",
                "Alert: Pollen counts rising, check allergy protocols."
            ]
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
