const { sequelize } = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const VerificationCode = require('./VerificationCode');
const UserLikes = require('./UserLikes');
const UserFavorites = require('./UserFavorites');
const Tag = require('./Tag');
const CommentLike = require('./CommentLike');

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

// 直接查询 UserLikes 和 UserFavorites 并包含 User 和 Post 信息，添加反向关联：
UserLikes.belongsTo(User, { foreignKey: 'userId', as: 'User' });
UserLikes.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });

UserFavorites.belongsTo(User, { foreignKey: 'userId', as: 'User' });
UserFavorites.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });

// 用户与评论的多对多关系（评论点赞）
User.belongsToMany(Comment, {
  through: CommentLike,
  as: 'LikedComments',
  foreignKey: 'userId',
  otherKey: 'commentId',
  onDelete: 'CASCADE'
});

Comment.belongsToMany(User, {
  through: CommentLike,
  as: 'LikedUsers',
  foreignKey: 'commentId',
  otherKey: 'userId',
  onDelete: 'CASCADE'
});
// 仅用于统计点赞数量
Comment.hasMany(CommentLike, { foreignKey: 'commentId', as: 'Likes' });
// 添加反向关联：CommentLike 连接 User 和 Comment
CommentLike.belongsTo(User, { foreignKey: 'userId', as: 'User' });
CommentLike.belongsTo(Comment, { foreignKey: 'commentId', as: 'Comment' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  VerificationCode,
  UserLikes,
  UserFavorites,
  Tag,
  CommentLike
};
