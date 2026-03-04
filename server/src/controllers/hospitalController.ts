import { Request, Response } from 'express';
import Hospital from '../models/Hospital.js';
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
