import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName: string = "gemini-2.0-flash") => {
    return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Generates a summary or analysis text based on a prompt
 */
export const generateAIResponse = async (prompt: string): Promise<string> => {
    try {
        const model = getGeminiModel("gemini-1.5-flash"); // Ensuring correct model name
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("Gemini AI Error:", error.message);
        // Try fallback if 1.5-flash fails
        if (error.message.includes('not found')) {
            try {
                const fallbackModel = getGeminiModel("gemini-pro");
                const fallbackResult = await fallbackModel.generateContent(prompt);
                return fallbackResult.response.text();
            } catch (fallbackError) {
                return "Analysis unavailable at the moment.";
            }
        }
        return "Analysis unavailable at the moment.";
    }
};

/**
 * Parses medical report data from an image (OCR + Intelligence)
 */
export const parseMedicalReport = async (imageBuffer: Buffer, mimeType: string): Promise<any> => {
    try {
        const model = getGeminiModel();
        const prompt = `
            You are a specialized Medical Data Extraction AI. 
            Analyze this medical report image and extract the following data in JSON format:
            {
                "recordType": "A descriptive category like Lab, Vitals, Imaging etc",
                "value": "The main numerical result or finding",
                "unit": "The unit of measurement if applicable",
                "date": "The date of the report in YYYY-MM-DD",
                "notes": "A brief 1-sentence summary of the finding"
            }
            Only return the JSON object.
        `;

        const imageParts = [
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType
                },
            },
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();

        // Extract JSON from response text (Gemini sometimes wraps in markdown blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse JSON from AI response");
    } catch (error) {
        console.error("OCR AI Error:", error);
        throw error;
    }
};
