const { sequelize, DataTypes } = require('../config/db');

const UserLikes = sequelize.define('UserLikes', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  tableName: 'user_likes',
});

module.exports = UserLikes;