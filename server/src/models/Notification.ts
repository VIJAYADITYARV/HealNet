import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g., 'helpful', 'admin_action', 'system'
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
