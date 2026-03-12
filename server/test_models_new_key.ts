import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (err) {
        console.error("Error gemini-1.5-flash:", err.message);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-2.0-flash:", result.response.text());
        } catch (err2) {
            console.error("Error gemini-2.0-flash:", err2.message);
        }
    }
}

test();
