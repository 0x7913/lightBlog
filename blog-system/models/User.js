const { sequelize, DataTypes, Op } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    bio: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    // ipAddress: {
    //     type: DataTypes.STRING(45), // 支持IPv6
    //     allowNull: true,
    // },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = User;
