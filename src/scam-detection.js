import express from 'express';
const router = express.Router();


//create middleware to check if a message is a scam
const checkUrl = async (req, res, next) => {
    const { message } = req.body;
    
    //check if there is a url in message
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const url = message.match(urlRegex);
    if (url) {
        //check if the url is a scam
        const scamUrl = await checkScamUrl(url[0]);
        if (scamUrl) {
            res.status(400).json({ error: 'Scam message detected' });
        }
    }
    next();
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


router.post('/', checkUrl, (req, res) => {
    const { message } = req.body;
    
    
    // TODO: url is not a scam, send the whole message to Flask Server
    res.status(200).json({ message: 'Message is not a scam' });
});
