const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('./db');
const app = express();
const port = 3000;

// Store active clients
const clients = new Map();

app.use(express.json());

// Route to create a new user connection
app.post('/user/new', async (req, res) => {
    const userId = Date.now().toString(); // Generate unique user ID
    const client = new Client();
    
    // Store the client
    clients.set(userId, client);
    
    // Handle QR code generation
    client.on('qr', async (qr) => {
        try {
            // Store QR code in database
            await db.upsertUser(userId, qr);
            qrcode.generate(qr, { small: true });
            res.json({ userId, qr });
        } catch (error) {
            console.error('Error storing QR code:', error);
            res.status(500).json({ error: 'Failed to store QR code' });
        }
    });
    
    // Handle messages for this specific client
    client.on('message_create', async message => {
        try {
            const messageText = message.body || JSON.stringify(message);
            console.log(`[User ${userId}] New message:`, messageText);
            
            // Store message in database
            await db.insertMessage(userId, messageText);
        } catch (error) {
            console.error('Error storing message:', error);
        }
    });
    
    // Initialize the client
    client.initialize();
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

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
