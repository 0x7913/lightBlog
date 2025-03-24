const { sequelize, DataTypes } = require('../config/db');

const UserFavorites = sequelize.define('UserFavorites', {
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
  tableName: 'user_favorites',
});

module.exports = UserFavorites;
