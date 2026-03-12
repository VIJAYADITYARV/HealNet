import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName: string = "gemini-flash-latest") => {
    // Permissive safety settings to avoid blocking benign medical trend analysis
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];
    return genAI.getGenerativeModel({ model: modelName, safetySettings });
};

/**
 * Generates a summary or analysis text based on a prompt
 */
export const generateAIResponse = async (prompt: string): Promise<string> => {
    try {
        const model = getGeminiModel("gemini-flash-latest");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (!responseText || responseText.length < 5) {
            throw new Error("Empty or too short AI response");
        }

        return responseText;
    } catch (error: any) {
        console.error("Gemini AI Error:", error.message);
        // Try fallback if latest fails
        try {
            const fallbackModel = getGeminiModel("gemini-2.0-flash");
            const fallbackResult = await fallbackModel.generateContent(prompt);
            return fallbackResult.response.text();
        } catch (fallbackError: any) {
            console.error("Gemini Fallback Error:", fallbackError.message);
            return "HealNet AI is processing community trends. Please refresh in a moment to see your personalized insights.";
        }
    }
};

/**
 * Parses medical report data from an image (OCR + Intelligence)
 */
export const parseMedicalReport = async (imageBuffer: Buffer, mimeType: string): Promise<any> => {
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

    try {
        const model = getGeminiModel("gemini-flash-latest");
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("Failed to parse JSON from AI response");
    } catch (error: any) {
        console.error("OCR AI Primary Error:", error.message);
        try {
            const model = getGeminiModel("gemini-2.0-flash");
            const result = await model.generateContent([prompt, ...imageParts]);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error("Failed to parse JSON from fallback AI response");
        } catch (fallbackError: any) {
            console.error("OCR AI Fallback Error:", fallbackError.message);
            throw fallbackError;
        }
    }
};
