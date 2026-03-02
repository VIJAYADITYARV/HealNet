import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAction extends Document {
    adminId: mongoose.Schema.Types.ObjectId;
    targetId: mongoose.Schema.Types.ObjectId;  // User ID or Experience ID
    actionType: 'approve' | 'remove' | 'ban';
    reason?: string;
    createdAt: Date;
}

const AdminActionSchema: Schema = new Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    actionType: { type: String, enum: ['approve', 'remove', 'ban'], required: true },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAdminAction>('AdminAction', AdminActionSchema);
