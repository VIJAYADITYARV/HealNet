import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Experience from '../models/Experience.js';

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
export const createComment = async (req: any, res: Response): Promise<void> => {
    try {
        const { experienceId, content } = req.body;

        if (!experienceId || !content) {
            res.status(400).json({ message: 'experienceId and content are required' });
            return;
        }

        const experience = await Experience.findById(experienceId);
        if (!experience) {
            res.status(404).json({ message: 'Experience not found' });
            return;
        }

        const comment = await Comment.create({
            experienceId,
            userId: req.user.id,
            content
        });

        // Increment commentCount
        await Experience.findByIdAndUpdate(experienceId, { $inc: { commentCount: 1 } });

        const populatedComment = await Comment.findById(comment._id).populate('userId', 'name username profilePicture isAnonymous');

        if (!populatedComment) {
            res.status(404).json({ message: 'Error retrieving comment after creation' });
            return;
        }

        let commentObj = populatedComment.toObject() as any;
        commentObj.isAuthor = true; // They just created it, so they are the author

        if (commentObj.userId && commentObj.userId.isAnonymous) {
            commentObj.userId = { _id: null, name: 'Anonymous User', username: 'anonymous', profilePicture: '' };
        }

        res.status(201).json(commentObj);
    } catch (error: any) {
        console.error("Error in createComment:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for an experience
// @route   GET /api/comments/:experienceId
// @access  Public
export const getCommentsForExperience = async (req: any, res: Response): Promise<void> => {
    try {
        const identifier = req.params.experienceId as string;
        if (!mongoose.Types.ObjectId.isValid(identifier)) {
            res.status(200).json([]);
            return;
        }

        const comments = await Comment.find({ experienceId: identifier })
            .populate('userId', 'name username profilePicture isAnonymous')
            .sort({ createdAt: -1 });

        const currentUserId = req.user ? req.user.id : null;

        const sanitizedComments = comments.map((c: any) => {
            const commentObj = c.toObject();
            const isAuthor = currentUserId && commentObj.userId && commentObj.userId._id && commentObj.userId._id.toString() === currentUserId;
            commentObj.isAuthor = isAuthor;

            if (commentObj.userId && commentObj.userId.isAnonymous) {
                commentObj.userId = { _id: null, name: 'Anonymous User', username: 'anonymous', profilePicture: '' };
            }
            return commentObj;
        });

        res.status(200).json(sanitizedComments);
    } catch (error: any) {
        console.error("Error in getCommentsForExperience:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req: any, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        if (comment.userId.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized to delete this comment' });
            return;
        }

        await comment.deleteOne();

        // Decrement commentCount
        await Experience.findByIdAndUpdate(comment.experienceId, { $inc: { commentCount: -1 } });

        res.status(200).json({ id: req.params.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
