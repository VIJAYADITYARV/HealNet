import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        console.log("Available Models:");
        response.data.models.forEach(m => {
            console.log(`${m.name} - ${m.supportedGenerationMethods.join(', ')}`);
        });
    } catch (err) {
        console.error("Error listing models:", err.response?.data || err.message);
    }
}

listModels();
