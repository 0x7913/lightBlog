const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, VerificationCode } = require("../models");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { authMiddleware, optional } = require("../middleware/authMiddleware");

const router = express.Router();

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//  发送邮箱验证码
router.post("/send-code", async (req, res) => {
  const { email } = req.body;

  try {
     // 生成 6 位数验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
 // 存储验证码
    await VerificationCode.create({ email, code, expiresAt });
// 配置邮件发送
    const transporter = nodemailer.createTransport({
      service: "qq",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "你的验证码",
      text: `你的验证码是: ${code}, 5分钟内有效`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.json({ code: 500, data: null, msg: "邮件发送失败" });
      }
      res.json({ code: 0, data: true, msg: "" });
    });
  } catch (error) {
    res.json({ code: 500, data: null, msg: "服务器错误" });
  }
});

//  用户注册
router.post("/register", async (req, res) => {
  const { username, email, password, code } = req.body;
  if (!code) {
    return res.json({ code: 400, data: null, msg: "验证码不能为空" });
  }

  try {
    const validCode = await VerificationCode.findOne({
      where: { email, code, expiresAt: { [Op.gt]: new Date() } },
    });

    if (!validCode) {
      return res.json({ code: 400, data: null, msg: "验证码无效或已过期" });
    }

    const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (existingUser) {
      return res.json({ code: 400, data: null, msg: "用户名或邮箱已被注册" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword, isVerified: true });

    await validCode.destroy();

    res.json({ code: 0, data: { token: generateToken(newUser) }, msg: "注册成功" });
  } catch (error) {
    res.json({ code: 500, data: null, msg: "服务器错误" });
  }
});
//  用户登录
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ code: 404, data: null, msg: "用户不存在" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ code: 400, data: null, msg: "密码错误" });

    res.json({ code: 0, data: { token: generateToken(user) }, msg: "登录成功" });
  } catch (error) {
    res.json({ code: 500, data: null, msg: "服务器错误" });
  }
});

// 获取用户信息（需要登录）
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.json({ code: 401, data: null, msg: "未提供 Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "avatar"]
    });

    if (!user) return res.json({ code: 404, data: null, msg: "用户不存在" });

    res.json({ code: 0, data: user, msg: "" });
  } catch (error) {
    res.json({ code: 401, data: null, msg: "Token 无效" });
  }
});

// 配置 Multer 存储头像
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/avatars/"); // 存放头像
  },
  filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // 获取后缀名
      const uniqueName = uuidv4() + ext; // 生成唯一文件名
      cb(null, uniqueName);
  }
});

const upload = multer({ storage });

//头像上传 API
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, data: null, msg: "请上传头像文件" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    res.json({ code: 0, data: { avatar: avatarPath }, msg: "" });
  } catch (error) {
    res.json({ code: 500, data: null, msg: "服务器错误" });
  }
});
//更新用户信息 API（前端传入 avatar URL）
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // 从 authMiddleware 获取用户 ID
    const { username, avatar } = req.body; // 头像由前端上传后传 URL

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({ code: 1, data: null, msg: "用户不存在" });
    }

    // 更新信息（如果前端没传 `username` 或 `avatar`，就保持原值）
    user.username = username || user.username;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({ code: 0, data: true, msg: "" }); // 成功返回 data = true，msg 为空
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({ code: 500, data: null, msg: "服务器错误" });
  }
});

module.exports = router;
