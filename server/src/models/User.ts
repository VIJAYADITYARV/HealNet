import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role: 'user' | 'admin';
    isAnonymous: boolean;
    contributorBadge: 'new' | 'contributor' | 'verified';
    moderationCount: number;
    healthProfile?: {
        ageGroup?: string;
        biologicalSex?: string;
        chronicConditions?: string[];
        allergies?: string[];
        pastSurgeries?: string[];
        lifestyleIndicators?: string[];
        aiPersonalizationEnabled?: boolean;
    };
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isAnonymous: { type: Boolean, default: false },
    contributorBadge: { type: String, enum: ['new', 'contributor', 'verified'], default: 'new' },
    moderationCount: { type: Number, default: 0 },
    healthProfile: {
        ageGroup: { type: String },
        biologicalSex: { type: String },
        chronicConditions: [{ type: String }],
        allergies: [{ type: String }],
        pastSurgeries: [{ type: String }],
        lifestyleIndicators: [{ type: String }],
        aiPersonalizationEnabled: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
