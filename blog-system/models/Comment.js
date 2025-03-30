const { sequelize, DataTypes, Op } = require('../config/db');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,  // 顶级评论为 null，子评论有父级 ID
        references: {
            model: "comments",
            key: "id"
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    postId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    replyToUsername: {
        type: DataTypes.STRING,
        allowNull: true, // 仅子评论有值，顶级评论为 null
    }
}, {
    timestamps: true,
});

module.exports = Comment;