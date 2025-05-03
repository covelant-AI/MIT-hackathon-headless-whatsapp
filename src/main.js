import express from 'express';
import scamDetectionRouter from './scam-detection.js';  
import { router as translationRouter } from './translation.js';
import { router as userRouter, restoreClients } from './user.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/scam', scamDetectionRouter);
app.use('/translate', translationRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Start the server and restore clients
app.listen(port, '0.0.0.0', async () => {
    console.log(`Server is running on port ${port}`);
    await restoreClients();
});
