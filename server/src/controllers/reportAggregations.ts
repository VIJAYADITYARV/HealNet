import { Request, Response } from 'express';
import Experience from '../models/Experience.js';
import SymptomQuery from '../models/SymptomQuery.js';
import AdminAction from '../models/AdminAction.js';

// @desc    Report 1: Hospital Mention Count
// @route   GET /api/reports-data/hospital-mentions
// @access  Private/Admin
export const getHospitalMentions = async (_req: Request, res: Response): Promise<void> => {
    try {
        const mentions = await Experience.aggregate([
            {
                $group: {
                    _id: '$hospital',
                    mentionCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    hospitalName: '$_id',
                    mentionCount: 1
                }
            },
            { $sort: { mentionCount: -1 } }
        ]);
        res.status(200).json(mentions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report 3: Experience Trend (Success vs Failure)
// @route   GET /api/reports-data/experience-trends
// @access  Private/Admin
export const getExperienceTrends = async (_req: Request, res: Response): Promise<void> => {
    try {
        const trends = await Experience.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [
                            { $in: ['$outcome', ['success', 'improvement']] },
                            'success',
                            { $cond: [{ $in: ['$outcome', ['no improvement', 'complication']] }, 'failure', 'ongoing'] }
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(trends);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report 4: Symptom Frequency
// @route   GET /api/reports-data/symptom-frequency
// @access  Private/Admin
export const getSymptomFrequency = async (_req: Request, res: Response): Promise<void> => {
    try {
        const frequencies = await Experience.aggregate([
            { $unwind: '$symptoms' },
            {
                $group: {
                    _id: { $toLower: '$symptoms' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    symptomName: '$_id',
                    count: 1
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        res.status(200).json(frequencies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report 2: Similar Case Match Count
// @route   GET /api/reports-data/similar-case-matches
// @access  Private/Admin
export const getSimilarCaseMatchCount = async (_req: Request, res: Response): Promise<void> => {
    try {
        const queryMatches = await SymptomQuery.aggregate([
            {
                $group: {
                    _id: { $toLower: '$queryText' },
                    totalQueries: { $sum: 1 },
                    avgMatches: { $avg: '$matchCount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    queryText: '$_id',
                    totalQueries: 1,
                    avgMatches: { $round: ['$avgMatches', 1] }
                }
            },
            { $sort: { totalQueries: -1 } },
            { $limit: 20 }
        ]);
        res.status(200).json(queryMatches);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report 5: Moderation Activity
// @route   GET /api/reports-data/moderation-activity
// @access  Private/Admin
export const getModerationActivity = async (_req: Request, res: Response): Promise<void> => {
    try {
        const activities = await AdminAction.aggregate([
            {
                $group: {
                    _id: '$actionType',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    actionType: '$_id',
                    count: 1
                }
            }
        ]);
        res.status(200).json(activities);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export Reports Data
// @route   GET /api/reports-data/export
// @access  Private/Admin
export const exportReportsData = async (_req: Request, res: Response): Promise<void> => {
    try {
        const mentions = await Experience.aggregate([{ $group: { _id: '$hospital', count: { $sum: 1 } } }]);
        const trends = await Experience.aggregate([{ $group: { _id: '$outcome', count: { $sum: 1 } } }]);
        const symptoms = await Experience.aggregate([{ $unwind: '$symptoms' }, { $group: { _id: { $toLower: '$symptoms' }, count: { $sum: 1 } } }]);
        const moderation = await AdminAction.aggregate([{ $group: { _id: '$actionType', count: { $sum: 1 } } }]);

        const exportData = {
            hospitalMentions: mentions,
            experienceTrends: trends,
            symptomFrequency: symptoms,
            moderationActivity: moderation,
            exportedAt: new Date().toISOString()
        };

        res.setHeader('Content-disposition', 'attachment; filename=reports_export.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).send(JSON.stringify(exportData, null, 2));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

