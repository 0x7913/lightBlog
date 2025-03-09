const { sequelize, DataTypes, Op } = require('../config/db');
const Post = require('./Post');

const Image = sequelize.define('Image', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    postId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    timestamps: true,
});

Image.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' });

module.exports = Image;