import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';

// @desc    Enable MFA - Setup (Generate Secret & QR)
// @route   POST /api/auth/mfa/setup
// @access  Private
export const setupMFA = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const secret = speakeasy.generateSecret({
            name: `HealNet (${user.email || user.username})`
        });

        // Store temporary secret (don't enable until verified)
        user.mfaSecret = secret.base32;
        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

        res.status(200).json({
            secret: secret.base32,
            qrCode: qrCodeUrl
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify and Activate MFA
// @route   POST /api/auth/mfa/verify
// @access  Private
export const verifyMFA = async (req: any, res: Response): Promise<void> => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user?._id).select('+mfaSecret');

        if (!user || !user.mfaSecret) {
            res.status(400).json({ message: 'MFA setup not initiated' });
            return;
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token,
            window: 1 // Allow for 30s clock drift
        });

        if (verified) {
            user.mfaEnabled = true;
            // Generate backup codes
            const backupCodes = Array.from({ length: 5 }, () =>
                Math.random().toString(36).substring(2, 10).toUpperCase()
            );
            user.backupCodes = backupCodes;
            await user.save();

            res.status(200).json({
                message: 'MFA activated successfully',
                backupCodes
            });
        } else {
            res.status(400).json({ message: 'Invalid verification code' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Disable MFA
// @route   POST /api/auth/mfa/disable
// @access  Private
export const disableMFA = async (req: any, res: Response): Promise<void> => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user?._id).select('+mfaSecret');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Potential TODO: Brcypt check password before disabling

        user.mfaEnabled = false;
        (user as any).mfaSecret = undefined;
        user.backupCodes = [];
        await user.save();

        res.status(200).json({ message: 'MFA disabled successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
