const { sequelize } = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const VerificationCode = require('./VerificationCode');
const UserLikes = require('./UserLikes');
const UserFavorites = require('./UserFavorites');
const Tag = require('./Tag');

// 用户和文章：一对多
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// 文章和评论：一对多
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// 自引用关系：评论可以有子评论（回复）
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// 文章和标签：多对多
Post.belongsToMany(Tag, { through: 'post_tags' });
Tag.belongsToMany(Post, { through: 'post_tags' });

// 用户与文章的多对多关系（点赞）
User.belongsToMany(Post, {
    through: UserLikes,
    foreignKey: 'userId',
    otherKey: 'postId',
    onDelete: 'CASCADE',
  });
  Post.belongsToMany(User, {
    through: UserLikes,
    foreignKey: 'postId',
    otherKey: 'userId',
    onDelete: 'CASCADE',
  });
  
  // 用户与文章的多对多关系（收藏）
  User.belongsToMany(Post, {
    through: UserFavorites,
    foreignKey: 'userId',
    otherKey: 'postId',
    onDelete: 'CASCADE',
  });
  Post.belongsToMany(User, {
    through: UserFavorites,
    foreignKey: 'postId',
    otherKey: 'userId',
    onDelete: 'CASCADE',
  });

// 导出模型和 sequelize 实例
module.exports = {
    sequelize,
    User,
    Post,
    Comment,
    VerificationCode,
    UserLikes,
    UserFavorites,
    Tag
};