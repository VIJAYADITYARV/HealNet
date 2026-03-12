import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
    try {
        console.log("Testing gemini-pro-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-pro-latest:", result.response.text());
    } catch (err) {
        console.error("Error gemini-pro-latest:", err.message);
    }
}

test();
