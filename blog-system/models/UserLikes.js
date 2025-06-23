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
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'user_likes',
});

module.exports = UserLikes;
