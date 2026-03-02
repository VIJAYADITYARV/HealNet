import mongoose, { Document, Schema } from 'mongoose';

export interface IQueryLog extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    inputText: string;
    filters?: {
        duration?: string;
        severity?: number;
        bodyArea?: string;
        location?: string;
        ageGroup?: string;
        existingConditions?: string[];
    };
    matchCount: number;
    createdAt: Date;
}

const QueryLogSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputText: { type: String, required: true },
    filters: {
        duration: { type: String },
        severity: { type: Number },
        bodyArea: { type: String },
        location: { type: String },
        ageGroup: { type: String },
        existingConditions: [{ type: String }]
    },
    matchCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

QueryLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IQueryLog>('QueryLog', QueryLogSchema);
