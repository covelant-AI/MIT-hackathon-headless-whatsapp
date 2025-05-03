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

const checkScamMessage = async (req, res, next) => {
    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        //TODO get classification from Flask server
        const classification = "scam";
        req.classification = classification;

        if (classification === "scam" || classification === "suspicious") {
            const explanation = await explainScam(message, classification);
            req.scamExplanation = explanation;
        }
        next();
    } catch (error) {
        console.error('Error in checkScamMessage middleware:', error);
        res.status(500).json({ error: 'Failed to analyze message' });
    }
};

export { checkScamMessage };