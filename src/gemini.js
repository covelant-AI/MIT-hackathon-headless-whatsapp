import { GoogleGenAI } from "@google/genai";

// Debug logging for API key
console.log('GOOGLE_GEMINI_API_KEY:', process.env.GOOGLE_GEMINI_API_KEY ? 'Present' : 'Missing');

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const explainScam = async (message, classification) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Our bot has detected the following message as '${classification}'. 
        Explain to the end user, in 1-2 sentences, why the message they received could be dangerous'${message}'`,
    });
    return response.text;
}

const checkScamMessage = async (message) => {
    if (!message) {
        throw new Error('Message is required');
    }

    const response = await fetch(process.env.AI_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_text: message })
    });

    if (!response.ok) {
        throw new Error(`AI endpoint request failed with status ${response.status}`);
    }

    const { classification } = await response.json();
    
    if (classification === "SCAM" || classification === "SUSPICIOUS") {
        const explanation = await explainScam(message, classification);
        return { classification, scamExplanation: explanation };
    }
    
    return { classification: "safe" };
};

export { checkScamMessage };