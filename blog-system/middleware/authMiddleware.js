const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config(); // 读取 .env 配置

const authMiddleware = async (req, res, next) => {
    try {
        // 获取请求头中的 token
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ message: "未授权访问" });
        }

        // 验证 token
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "用户不存在" });
        }

        // 将用户信息挂载到请求对象
        req.user = user;
        next();
    } catch (error) {
        console.error("身份验证失败:", error);
        res.status(401).json({ message: "身份验证失败" });
    }
};
const optional = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(); // 没 token 直接放行

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user) {
            req.user = user; // 登录状态，挂上 user
        }
    } catch (err) {
        // token 有问题也跳过，不抛出错误
    }

    next(); // 总是放行
};

module.exports = {
    authMiddleware,
    optional,
};
