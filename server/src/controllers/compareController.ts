import { Request, Response } from 'express';
import Experience from '../models/Experience.js';

export const compareEntities = async (req: Request, res: Response): Promise<void> => {
    try {
        const { condition, location, comparisonType, comparisonList, filters } = req.body;

        if (!comparisonType || !comparisonList || !Array.isArray(comparisonList)) {
            res.status(400).json({ message: 'Missing required comparison parameters' });
            return;
        }

        const matchStage: any = {};
        if (condition) matchStage.condition = { $regex: new RegExp(condition, 'i') };
        if (location) matchStage.city = { $regex: new RegExp(location, 'i') };

        let groupEntityField = '';
        if (comparisonType === 'hospital') {
            matchStage.hospital = { $in: comparisonList };
            groupEntityField = '$hospital';
        } else if (comparisonType === 'treatment') {
            matchStage.treatment = { $in: comparisonList };
            groupEntityField = '$treatment';
        } else {
            res.status(400).json({ message: 'Invalid comparison type' });
            return;
        }

        const stats = await Experience.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupEntityField,
                    totalCases: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: [{ $in: ['$outcome', ['success', 'improvement']] }, 1, 0] }
                    },
                    failureCount: {
                        $sum: { $cond: [{ $in: ['$outcome', ['complication', 'no improvement']] }, 1, 0] }
                    },
                    totalRecoveryDays: {
                        $sum: {
                            $let: {
                                vars: {
                                    days: {
                                        $convert: {
                                            input: { $arrayElemAt: [{ $split: ['$recoveryTime', ' '] }, 0] },
                                            to: 'int',
                                            onError: 0,
                                            onNull: 0
                                        }
                                    }
                                },
                                in: '$$days'
                            }
                        }
                    },
                    lowCost: { $sum: { $cond: [{ $eq: ['$costRange', 'low'] }, 1, 0] } },
                    mediumCost: { $sum: { $cond: [{ $eq: ['$costRange', 'medium'] }, 1, 0] } },
                    highCost: { $sum: { $cond: [{ $eq: ['$costRange', 'high'] }, 1, 0] } }
                }
            },
            {
                $project: {
                    entity: '$_id',
                    totalCases: 1,
                    successRate: { $round: [{ $multiply: [{ $divide: ['$successCount', '$totalCases'] }, 100] }] },
                    complicationRate: { $round: [{ $multiply: [{ $divide: ['$failureCount', '$totalCases'] }, 100] }] },
                    avgRecoveryDays: { $round: [{ $divide: ['$totalRecoveryDays', '$totalCases'] }] },
                    costDistribution: {
                        low: { $round: [{ $multiply: [{ $divide: ['$lowCost', '$totalCases'] }, 100] }] },
                        medium: { $round: [{ $multiply: [{ $divide: ['$mediumCost', '$totalCases'] }, 100] }] },
                        high: { $round: [{ $multiply: [{ $divide: ['$highCost', '$totalCases'] }, 100] }] }
                    }
                }
            }
        ]);

        let rankedResults = [...stats];
        // Apply priority ranking
        if (filters?.priority) {
            if (filters.priority === 'highestSuccess') {
                rankedResults.sort((a, b) => b.successRate - a.successRate);
            } else if (filters.priority === 'lowestRisk') {
                rankedResults.sort((a, b) => a.complicationRate - b.complicationRate);
            } else if (filters.priority === 'fastestRecovery') {
                rankedResults.sort((a, b) => a.avgRecoveryDays - b.avgRecoveryDays);
            }
        } else {
            // Default sort by success rate
            rankedResults.sort((a, b) => b.successRate - a.successRate);
        }

        res.status(200).json({
            comparisonType,
            condition,
            location,
            rankedResults
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
