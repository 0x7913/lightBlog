const { sequelize } = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const VerificationCode = require('./VerificationCode')

// ⚠️ 将模型进行关联，防止循环引用问题
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' });

Comment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// 将模型和 sequelize 导出
module.exports = {
    sequelize,
    User,
    Post,
    Comment,
    VerificationCode
};
