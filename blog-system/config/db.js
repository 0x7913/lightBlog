//配置数据库连接
const { Sequelize, DataTypes, Op } = require("sequelize")

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false, // 关闭 SQL 日志
});
sequelize.sync({ force: false })
  .then(() => console.log('数据库同步完成'))
  .catch(err => console.error('同步失败:', err));
sequelize.authenticate()
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch((err) => {
        console.log('数据库连接失败', err);
    });
    
module.exports = { sequelize, DataTypes, Op };