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

module.exports = authMiddleware;
