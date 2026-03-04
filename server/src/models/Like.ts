import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
    experienceId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LikeSchema: Schema = new Schema({
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

LikeSchema.index({ experienceId: 1, userId: 1 }, { unique: true });

export default mongoose.model<ILike>('Like', LikeSchema);
