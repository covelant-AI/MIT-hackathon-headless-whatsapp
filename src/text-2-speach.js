import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import express from 'express';
const router = express.Router();

// Creates a client using service account credentials
const client = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Convert text to speech
 * @param {string} text - Text to convert to speech
 * @param {string} languageCode - Language code (e.g., 'en-US')
 * @returns {Promise<Buffer>} - Audio buffer
 */
async function convertTextToSpeech(text, languageCode = 'en-US') {
    try {
        const request = {
            input: { text },
            voice: { 
                languageCode,
                ssmlGender: 'NEUTRAL'
            },
            audioConfig: { 
                audioEncoding: 'MP3'
            },
        };

        const [response] = await client.synthesizeSpeech(request);
        return response.audioContent;
    } catch (error) {
        console.error('Text-to-speech error:', error);
        throw error;
    }
}

// Text-to-speech middleware
const doTextToSpeech = async (req, res, next) => {
    try {
        const { text, languageCode } = req.body;
        
        if (!text) {
            return res.status(400).json({ 
                error: 'Missing required field: text' 
            });
        }

        const audioBuffer = await convertTextToSpeech(text, languageCode);
        req.audioBuffer = audioBuffer;
        next();
    } catch (error) {
        res.status(500).json({ 
            error: 'Text-to-speech conversion failed', 
            details: error.message 
        });
    }
};

// Text-to-speech endpoint
router.post('/', doTextToSpeech, (req, res) => {
    res.set('Content-Type', 'audio/mpeg');
    res.send(req.audioBuffer);
});

export {
    router,
    doTextToSpeech,
    convertTextToSpeech
}; 