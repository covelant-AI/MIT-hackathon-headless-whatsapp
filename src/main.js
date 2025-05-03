import express from 'express';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import db from './db.js';
import scamDetectionRouter from './scam-detection.js';  
import { router as translationRouter} from './translation.js';

const app = express();
const port = 3000;
// Store active clients
const clients = new Map();

app.use(express.json());
app.use('/scam', scamDetectionRouter);
app.use('/translate', translationRouter);
// Function to create a new client with session persistence
function createClient(userId) {
    return new Client({
        authStrategy: new LocalAuth({
            clientId: userId,
            dataPath: '.wwebjs_cache'
        }),
        puppeteer: {
            args: ['--no-sandbox']
        }
    });
}

// Function to initialize a client
async function initializeClient(userId) {
    const client = createClient(userId);
    clients.set(userId, client);

    // Handle QR code generation
    client.on('qr', async (qr) => {
        try {
            await db.upsertUser(userId, qr);
            qrcode.generate(qr, { small: true });
        } catch (error) {
            console.error('Error storing QR code:', error);
        }
    });

    // Handle authentication success
    client.on('authenticated', async () => {
        console.log(`User ${userId} authenticated successfully`);
        await db.upsertUser(userId, 'AUTHENTICATED');
    });

    // Handle ready state
    client.on('ready', async () => {
        console.log(`Client ${userId} is ready!`);
        await db.upsertUser(userId, 'READY');
    });
    
    // Handle messages for this specific client
    client.on('message_create', async message => {
        try {
            // Store the entire message object as a JSON string
            const messageJson = JSON.stringify(message);
            await db.insertMessage(userId, messageJson);
        } catch (error) {
            console.error('Error storing message:', error);
        }
    });

    // Initialize the client
    client.initialize();
}

// Restore existing clients on server start
async function restoreClients() {
    try {
        const users = await db.getAllUsers();
        console.log(`Found ${users.length} existing users, restoring sessions...`);
        
        for (const user of users) {
            console.log(`Restoring session for user ${user.id}`);
            await initializeClient(user.id);
        }
    } catch (error) {
        console.error('Error restoring clients:', error);
    }
}

// Route to create a new user connection
app.post('/user/new', async (req, res) => {
    const userId = Date.now().toString();
    try {
        await initializeClient(userId);
        res.json({ userId });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ error: 'Failed to create new user' });
    }
});

// Route to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Route to get messages for a specific user
app.get('/users/:userId/messages', async (req, res) => {
    try {
        const messages = await db.getUserMessages(req.params.userId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Route to check session status
app.get('/users/:userId/status', async (req, res) => {
    const userId = req.params.userId;
    const client = clients.get(userId);
    
    if (!client) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    try {
        const state = await client.getState();
        res.json({ status: state });
    } catch (error) {
        console.error('Error getting client state:', error);
        res.status(500).json({ error: 'Failed to get client state' });
    }
});

// Route to get all messages with user info
app.get('/messages/all', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        const allMessages = [];
        
        for (const user of users) {
            const messages = await db.getUserMessages(user.id);
            allMessages.push({
                userId: user.id,
                lastMessageAt: user.lastMessageAt,
                messages: messages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    createdAt: msg.createdAt
                }))
            });
        }
        
        res.json(allMessages);
    } catch (error) {
        console.error('Error fetching all messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Start the server and restore clients
app.listen(port, '0.0.0.0', async () => {
    console.log(`Server is running on port ${port}`);
    await restoreClients();
});
