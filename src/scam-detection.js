import express from 'express';
const router = express.Router();
import { doTranslation } from './translation.js';
import { checkScamMessage } from './gemini.js';
import { doTextToSpeech } from './text-2-speach.js';
// Function to check if a message contains a scam URL
const checkUrl = async (message) => {
    //check if there is a url in message
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const url = message.match(urlRegex);
    if (url) {
        //check if the url is a scam
        const scamUrl = await checkScamUrl(url[0]);
        if (scamUrl) {
            return true;
        }
    }
    return false;
};

// checkScamUrl makes call to GOOGLE sage browsing api to check if a url is a scam
const checkScamUrl = async (url) => {
    // Prepare URLs to check
    const urlsToCheck = url.startsWith('http://') || url.startsWith('https://') 
        ? [url] 
        : [`http://${url}`, `https://${url}`];

    const requestBody = {
        client: {
            clientId: "cov-mit-headless",
            clientVersion: "1.0.0"
        },
        threatInfo: {
            threatTypes: ["THREAT_TYPE_UNSPECIFIED", "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: urlsToCheck.map(url => ({ url }))
        }
    };

    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    return data.matches ? data.matches.length > 0 : false;
};

export default router;
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Check for scam URLs
        const isScamUrl = await checkUrl(message);
        if (isScamUrl) {
            return res.status(400).json({ error: 'Scam message detected' });
        }
        
        // Translate the message
        const { translation, originalLanguage } = await doTranslation(message);
        
        // Check if the message is a scam
        let { classification, scamExplanation } = await checkScamMessage(translation);

        if (classification === "safe") {
            return res.status(200).json({ message: 'Message is not a scam' });
        }

        if (originalLanguage !== 'en') {
            const { translation: t } = await doTranslation(scamExplanation, originalLanguage);
            scamExplanation = t;
        }

        const audioBuffer = await doTextToSpeech(scamExplanation, originalLanguage);

        return res.status(400).json({ 
            classification, 
            explanation: scamExplanation,
            audioBuffer
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Scam detection failed', 
            details: error.message 
        });
    }
});
