import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import User from '../models/User.js';

const generateToken = (id: string, isAnonymous: boolean) => {
    return jwt.sign({ id, isAnonymous }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || (!email && !phone) || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }

        // Fix: Only build the query with provided identifiers to avoid matching 'null/undefined'
        const query: any[] = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });
        if (req.body.username) query.push({ username: req.body.username });

        const userExists = query.length > 0 ? await User.findOne({ $or: query }) : null;

        if (userExists) {
            res.status(400).json({ message: 'User with this email, phone or username already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Auto-generate username if not given
        let username = req.body.username;
        if (!username) {
            username = (name.replace(/\s+/g, '').toLowerCase()) + Math.floor(1000 + Math.random() * 9000);
        }

        const user = await User.create({
            name,
            username,
            email,
            phone,
            password: hashedPassword,
            role: role || 'user',
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                isAnonymous: user.isAnonymous,
                token: generateToken(user.id as string, user.isAnonymous),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        console.error('[registerUser]', error.message);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, phone, password } = req.body;

        const query: any[] = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });

        if (query.length === 0) {
            res.status(400).json({ message: 'Email or Phone is required' });
            return;
        }

        const user = await User.findOne({ $or: query });

        if (user && (await bcrypt.compare(password, user.password as string))) {
            if (user.mfaEnabled) {
                // Return challenge, not full token
                res.json({
                    _id: user.id,
                    mfaRequired: true,
                    tempToken: jwt.sign({ id: user.id, mfaPending: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '5m' })
                });
                return;
            }

            res.json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                isAnonymous: user.isAnonymous,
                token: generateToken(user.id as string, user.isAnonymous),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error: any) {
        console.error('[loginUser]', error.message);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Verify MFA token during login
// @route   POST /api/auth/mfa/login-verify
// @access  Public (Requires tempToken)
export const verifyMFALogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tempToken, token } = req.body;

        if (!tempToken || !token) {
            res.status(400).json({ message: 'MFA token and verification code required' });
            return;
        }

        const decoded: any = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id).select('+mfaSecret +backupCodes');

        if (!user || !user.mfaEnabled || !user.mfaSecret) {
            res.status(401).json({ message: 'MFA not active for this account' });
            return;
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (verified) {
            res.json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                isAnonymous: user.isAnonymous,
                token: generateToken(user.id as string, user.isAnonymous),
            });
        } else {
            // Check if it's a backup code
            if (user.backupCodes?.includes(token)) {
                // Remove used backup code
                user.backupCodes = user.backupCodes.filter(c => c !== token);
                await user.save();

                res.json({
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isAnonymous: user.isAnonymous,
                    token: generateToken(user.id as string, user.isAnonymous),
                });
            } else {
                res.status(401).json({ message: 'Invalid MFA code' });
            }
        }
    } catch (error: any) {
        res.status(401).json({ message: 'MFA session expired' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: any, res: Response): Promise<void> => {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
};
