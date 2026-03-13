import { Request, Response } from 'express';
import Hospital from '../models/Hospital.js';
import Experience from '../models/Experience.js';
import cache from '../utils/cache.js';

// @desc    Search hospitals by name or city
// @route   GET /api/hospitals
// @access  Private
export const searchHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ message: 'Query parameter is required' });
            return;
        }

        const cacheKey = `hospital_search_${(query as string).toLowerCase().trim()}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
            return;
        }

        const hospitals = await Hospital.find({
            $or: [
                { name: { $regex: query as string, $options: 'i' } },
                { city: { $regex: query as string, $options: 'i' } }
            ]
        } as any).limit(10); // Limit results for autocomplete

        cache.set(cacheKey, hospitals, 3600); // Cache for 1 hour

        res.status(200).json(hospitals);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all hospitals (for dropdown)
// @route   GET /api/hospitals/all
// @access  Private
export const getAllHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const cacheKey = 'all_hospitals';
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
            return;
        }

        const hospitals = await Hospital.find().sort({ name: 1 });
        cache.set(cacheKey, hospitals, 86400); // Cache for 24 hours as this rarely changes

        res.status(200).json(hospitals);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new hospital (optional, for seeding or user contribution)
// @route   POST /api/hospitals
// @access  Private
export const addHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, city, state, address, website } = req.body;

        const hospitalExists = await Hospital.findOne({ name });

        if (hospitalExists) {
            res.status(400).json({ message: 'Hospital already exists' });
            return;
        }

        const hospital = await Hospital.create({
            name,
            city,
            state,
            address,
            website
        });

        res.status(201).json(hospital);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get hospital by ID with metadata
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        res.status(200).json(hospital);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hospital metadata
// @route   PUT /api/hospitals/:id
// @access  Private/Admin
export const updateHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hospital) {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        // clear cache
        cache.del('all_hospitals');
        res.status(200).json(hospital);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get detailed insights for a specific hospital (Business Case for Hospitals)
// @route   GET /api/hospitals/:id/insights
// @access  Public
export const getHospitalInsights = async (req: Request, res: Response): Promise<void> => {
    try {
        let hospital;
        const { id } = req.params;

        // Try to find by ID first (if valid ObjectId)
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            hospital = await Hospital.findById(id);
        }

        // Fallback: If not found or ID is not an ObjectId, try finding by name (matches demo data)
        if (!hospital) {
            // Check if ID 1, 2, 3 etc matches our demo set names
            const mockNames: Record<string, string> = {
                '1': 'Apollo Hospitals',
                '2': 'AIIMS Delhi',
                '3': 'Fortis Healthcare',
                '4': 'Max Super Speciality',
                '5': 'Narayana Health',
                '6': 'Manipal Hospital'
            };
            const targetName = mockNames[id] || id;
            hospital = await Hospital.findOne({ name: new RegExp(`^${targetName}$`, 'i') });
        }

        if (!hospital) {
            res.status(404).json({ message: 'Hospital records not yet synchronized in the analytics engine.' });
            return;
        }

        // Aggregate experiences for this hospital
        const stats = await Experience.aggregate([
            { $match: { hospital: hospital.name } },
            {
                $group: {
                    _id: '$hospital',
                    totalExperiences: { $sum: 1 },
                    avgHelpfulCount: { $avg: '$helpfulCount' },
                    outcomes: {
                        $push: '$outcome'
                    },
                    conditions: {
                        $push: '$condition'
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            res.status(200).json({
                hospital,
                insights: {
                    totalExperiences: 0,
                    successRate: 0,
                    outcomeBreakdown: [],
                    topConditions: [],
                    recentExperiences: []
                }
            });
            return;
        }

        const hospitalData = stats[0];

        // Process outcomes
        const outcomeCounts: Record<string, number> = {};
        let successCount = 0;
        hospitalData.outcomes.forEach((o: string) => {
            outcomeCounts[o] = (outcomeCounts[o] || 0) + 1;
            if (['success', 'improvement'].includes(o)) successCount++;
        });

        // Process conditions
        const conditionCounts: Record<string, number> = {};
        hospitalData.conditions.forEach((c: string) => {
            conditionCounts[c] = (conditionCounts[c] || 0) + 1;
        });

        const topConditions = Object.entries(conditionCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const outcomeBreakdown = Object.entries(outcomeCounts)
            .map(([name, value]) => ({ name, value }));

        // Get latest 5 experiences
        const recentExperiences = await Experience.find({ hospital: hospital.name })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name');

        res.status(200).json({
            hospital,
            insights: {
                totalExperiences: hospitalData.totalExperiences,
                successRate: Math.round((successCount / hospitalData.totalExperiences) * 100),
                outcomeBreakdown,
                topConditions,
                recentExperiences
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
