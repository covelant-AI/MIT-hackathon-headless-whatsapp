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

// Translation function
const doTranslation = async (message, targetLanguage = 'en') => {
    if (!message) {
        throw new Error('Missing required field: message');
    }
    return await translateText(message, targetLanguage);
};

// Translation endpoint
router.post('/', async (req, res) => {
    try {
        const { message, targetLanguage } = req.body;
        const translation = await doTranslation(message, targetLanguage);
        res.json({ translation });
    } catch (error) {
        res.status(500).json({ 
            error: 'Translation failed', 
            details: error.message 
        });
    }
});

module.exports = {
    router,
    doTranslation
};
