const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

// Initialize database
async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync all models
        await sequelize.sync();
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Get user
async function getUser(userId) {
    return await User.findOne({ where: { id: userId } });
}

// Insert or update user
async function upsertUser(userId, qrCode) {
    return await User.upsert({
        id: userId,
        qrCode: qrCode
    });
}

// Insert message
async function insertMessage(userId, message) {
    const msg = await Message.create({
        userId: userId,
        message: message
    });
    
    // Update last message timestamp
    await User.update(
        { lastMessageAt: new Date() },
        { where: { id: userId } }
    );
    
    return msg;
}

// Get all users
async function getAllUsers() {
    return await User.findAll();
}

// Get messages for a user
async function getUserMessages(userId) {
    return await Message.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
    });
}

// Initialize database on module load
initDatabase();

module.exports = {
    upsertUser,
    insertMessage,
    getAllUsers,
    getUserMessages,
    getUser
}; 