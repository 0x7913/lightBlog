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
Post.belongsToMany(Tag, { through: 'post_tags', as: 'Tags' });
Tag.belongsToMany(Post, { through: 'post_tags', as: 'Posts' });

// 用户与文章的多对多关系（点赞）
User.belongsToMany(Post, { 
  through: UserLikes, 
  as: 'LikedPosts', 
  foreignKey: 'userId', 
  otherKey: 'postId', 
  onDelete: 'CASCADE'
});
Post.belongsToMany(User, { 
  through: UserLikes, 
  as: 'LikedUsers', 
  foreignKey: 'postId', 
  otherKey: 'userId', 
  onDelete: 'CASCADE'
});
  
// 用户与文章的多对多关系（收藏）
User.belongsToMany(Post, { 
  through: UserFavorites, 
  as: 'FavoritedPosts', 
  foreignKey: 'userId', 
  otherKey: 'postId', 
  onDelete: 'CASCADE'
});
Post.belongsToMany(User, { 
  through: UserFavorites, 
  as: 'FavoritedUsers', 
  foreignKey: 'postId', 
  otherKey: 'userId', 
  onDelete: 'CASCADE'
});

// 如果希望直接查询 UserLikes 和 UserFavorites 并包含 User 和 Post 信息，也添加反向关联：
UserLikes.belongsTo(User, { foreignKey: 'userId', as: 'User' });
UserLikes.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });

UserFavorites.belongsTo(User, { foreignKey: 'userId', as: 'User' });
UserFavorites.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });

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
