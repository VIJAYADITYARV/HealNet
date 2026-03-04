import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    experienceId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const CommentSchema: Schema = new Schema({
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
}, {
    timestamps: true
});

CommentSchema.index({ experienceId: 1, createdAt: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
