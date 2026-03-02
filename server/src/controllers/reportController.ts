import { Request, Response } from 'express';
import Report from '../models/Report.js';
import Experience from '../models/Experience.js';
import User from '../models/User.js';
import AdminAction from '../models/AdminAction.js';

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req: any, res: Response): Promise<void> => {
    try {
        const { experienceId, reason, details } = req.body;

        const report = await Report.create({
            experienceId,
            reporterId: req.user._id,
            reason,
            details
        });

        res.status(201).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
export const getReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const reports = await Report.find()
            .populate('reporterId', 'name email')
            .populate('experienceId', 'title condition hospital')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private/Admin
export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        report.status = status;
        await report.save();

        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Perform an admin action (approve, remove, ban)
// @route   PATCH /api/admin/action
// @access  Private/Admin
export const handleAdminAction = async (req: any, res: Response): Promise<void> => {
    try {
        const { targetId, actionType, reason, itemType } = req.body; // itemType: 'experience' or 'user' (for ban)

        if (!['approve', 'remove', 'ban'].includes(actionType)) {
            res.status(400).json({ message: 'Invalid action type' });
            return;
        }

        // 1. Record the action
        await AdminAction.create({
            adminId: req.user._id,
            targetId,
            actionType,
            reason
        });

        // 2. Perform the logic
        if (actionType === 'remove' && itemType === 'experience') {
            await Experience.findByIdAndDelete(targetId);
            // Optionally update report status related to this experience
            await Report.updateMany({ experienceId: targetId }, { status: 'resolved' });
        } else if (actionType === 'ban' && itemType === 'user') {
            await User.findByIdAndDelete(targetId);
            // Delete their experiences
            await Experience.deleteMany({ userId: targetId });
        } else if (actionType === 'approve' && itemType === 'experience') {
            // Just resolve reports
            await Report.updateMany({ experienceId: targetId }, { status: 'resolved' });
        }

        // 3. Increment moderation count for Admin
        await User.findByIdAndUpdate(req.user._id, { $inc: { moderationCount: 1 } });

        res.status(200).json({ message: `Action ${actionType} completed successfully` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
