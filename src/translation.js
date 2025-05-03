const {Translate} = require('@google-cloud/translate').v2;
const express = require('express');
const router = express.Router();

// Initialize translate with API key
const translate = new Translate({
    key: process.env.GOOGLE_API_KEY
});

/**
 * Simple translation function
 * @param {string} text
 * @param {string} targetLanguage 
 */
async function translateText(text, targetLanguage) {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY environment variable is not set');
        }
        const [translation] = await translate.translate(text, targetLanguage);
        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

// Translation middleware
const doTranslation = async (req, res, next) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Missing required field: message' 
            });
        }

        const targetLanguage = 'en';
        const translation = await translateText(message, targetLanguage);
        req.translation = translation;
        next();
    } catch (error) {
        res.status(500).json({ 
            error: 'Translation failed', 
            details: error.message 
        });
    }
};

// Translation endpoint
router.post('/', doTranslation, (req, res) => {
    res.json({ translation: req.translation });
});

module.exports = {
    router,
    doTranslation
};
