import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Experience from './src/models/Experience.js';
import User from './src/models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/healnet";

async function importData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        let dummyUser = await User.findOne({ email: 'dummy@synthetic.com' });
        if (!dummyUser) {
            dummyUser = new User({
                name: 'Synthetic User',
                username: 'synthetic123',
                email: 'dummy@synthetic.com',
                password: 'password123',
                role: 'user',
            });
            await dummyUser.save();
        }

        const dataPath = path.resolve(__dirname, '../synthetic_experiences.json');
        console.log(`Loading data from ${dataPath}`);

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const experiences = JSON.parse(rawData);

        const formattedExperiences = experiences.map((exp: any) => {
            let outcome = exp.outcome;
            if (outcome === 'failure') outcome = 'complication';

            return {
                userId: dummyUser._id,
                hospital: exp.hospitalName,
                condition: exp.condition,
                symptoms: exp.symptoms,
                treatment: exp.treatment,
                outcome: outcome,
                recoveryTime: `${exp.recoveryTimeDays} days`,
                description: exp.experienceText,
                city: exp.city,
                costRange: exp.costRange,
                helpfulCount: Math.floor(Math.random() * 50),
                isAnonymous: Math.random() > 0.5,
                createdAt: new Date(exp.createdAt)
            }
        });

        await Experience.deleteMany({ userId: dummyUser._id }); // Clear previous to avoid duplicates on re-run
        console.log('Cleared old dummy experiences.');

        await Experience.insertMany(formattedExperiences);
        console.log(`Successfully imported ${formattedExperiences.length} records!`);

    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from DB');
    }
}

importData();
