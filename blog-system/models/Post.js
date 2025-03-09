const { sequelize, DataTypes, Op } = require('../config/db');
const User = require('./User'); // 引入 User 模型

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    timestamps: true,
});

Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' }); // 外键关联

module.exports = Post;