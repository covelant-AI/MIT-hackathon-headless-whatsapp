const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    qrCode: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: true,
    updatedAt: false
});

module.exports = User; 