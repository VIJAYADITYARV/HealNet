import mongoose, { Document, Schema } from 'mongoose';

export interface ISymptomQuery extends Document {
    queryText: string;
    matchCount: number;
    createdAt: Date;
}

const SymptomQuerySchema: Schema = new Schema({
    queryText: { type: String, required: true },
    matchCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISymptomQuery>('SymptomQuery', SymptomQuerySchema);
