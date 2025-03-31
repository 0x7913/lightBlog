const { sequelize, DataTypes } = require('../config/db');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = Tag;