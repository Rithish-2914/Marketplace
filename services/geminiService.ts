import { GoogleGenAI } from "@google/genai";
import { ItemCategory } from '../types';

// This service uses the Google GenAI API to generate item descriptions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDescription = async (title: string, category: ItemCategory): Promise<string> => {
    console.log(`Generating description for title: "${title}" in category: "${category}"`);
    
    try {
        const prompt = `Write a short, appealing marketplace description for a second-hand item for a student marketplace. The item is a "${title}" in the category "${category}". Keep it concise, under 50 words. Highlight its key features and condition for a student audience.`;
        
        const response = await ai.models.generateContent({ 
            model: 'gemini-2.5-flash', 
            contents: prompt 
        });

        // The .text property provides direct access to the generated text.
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        // Fallback to a generic description on error
        return `This is a ${title} in the ${category} category. It is a useful item for any student. Please contact the seller for more details.`;
    }
};
