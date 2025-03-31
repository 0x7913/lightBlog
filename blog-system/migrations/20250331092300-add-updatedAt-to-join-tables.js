'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 为 user_likes 表添加 updatedAt 字段
    await queryInterface.addColumn('user_likes', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // 为 user_favorites 表添加 updatedAt 字段
    await queryInterface.addColumn('user_favorites', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚时移除 updatedAt 字段
    await queryInterface.removeColumn('user_likes', 'updatedAt');
    await queryInterface.removeColumn('user_favorites', 'updatedAt');
  }
};