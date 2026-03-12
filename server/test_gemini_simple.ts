import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        // The listModels method is on the genAI instance
        // Note: This might require an older version or specific setup if not found
        // Let's try to reach the endpoint directly if needed, but let's try the SDK first.
        console.log("Fetching models...");

        // In newer SDKs, you might need to use the generativeLanguage client or similar
        // But let's try a different approach: try calling a known model with v1 instead of v1beta

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash:", result.response.text());

    } catch (err) {
        console.error("Error:", err.message);
    }
}

listModels();
