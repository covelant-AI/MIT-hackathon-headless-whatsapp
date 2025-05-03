import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import scamDetectionRouter from './scam-detection.js';  
import { router as translationRouter } from './translation.js';
import { router as userRouter, restoreClients } from './user.js';
import { router as textToSpeechRouter } from './text-2-speach.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// TODO: REMOVE ALL ROUTERS BEFORE DEPLOYMENT
app.use('/scam', scamDetectionRouter);
app.use('/translate', translationRouter);
app.use('/users', userRouter);
app.use('/users/:userId/qr', express.static(path.join(__dirname, 'views')));
app.use('/text-2-speech', textToSpeechRouter);

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Start the server and restore clients
app.listen(port, '0.0.0.0', async () => {
    console.log(`Server is running on port ${port}`);
    await restoreClients();
});
