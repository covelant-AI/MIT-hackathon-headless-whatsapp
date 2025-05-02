const db = require('./db');

console.log('Starting message monitor...');
console.log('Press Ctrl+C to exit');

// Function to check for new messages
async function checkNewMessages() {
    try {
        const users = await db.getAllUsers();
        for (const user of users) {
            const messages = await db.getUserMessages(user.id);
            if (messages.length > 0) {
                const latestMessage = messages[0];
                console.log('\n=== New Message ===');
                console.log(`User ID: ${user.id}`);
                console.log(`Time: ${latestMessage.createdAt}`);
                console.log(`Message: ${latestMessage.message}`);
                console.log('==================\n');
            }
        }
    } catch (error) {
        console.error('Error checking messages:', error);
    }
}

// Check for new messages every 5 seconds
setInterval(checkNewMessages, 5000);

// Initial check
checkNewMessages(); 