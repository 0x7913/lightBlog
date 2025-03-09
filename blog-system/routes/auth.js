const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User")
const VerificationCode = require("../models/VerificationCode")
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

const router = express.Router();

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//  发送邮箱验证码
router.post("/send-code", async (req, res) => {
  const { email } = req.body;

  // 生成 6 位数验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 分钟后过期

  // 存储验证码
  await VerificationCode.create({ email, code, expiresAt });

  // 配置邮件发送
  const transporter = nodemailer.createTransport({
    service: "qq", // 可以改成 Gmail、163 等
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
      return res.status(500).json({ message: "邮件发送失败" });
    }
    res.json({ message: "验证码已发送" });
  });
});

//  用户注册
router.post("/register", async (req, res) => {
  const { username, email, password, code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "验证码不能为空" });
  }
  // 校验验证码
  const validCode = await VerificationCode.findOne({
    where: { email, code, expiresAt: { [Op.gt]: new Date() } },
  });

  if (!validCode) {
    return res.status(400).json({ message: "验证码无效或已过期" });
  }

  // 检查用户是否存在
  const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
  if (existingUser) return res.status(400).json({ message: "用户名或邮箱已被注册" });

  // 哈希加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const newUser = await User.create({ username, email, password: hashedPassword, isVerified: true });

  // 删除验证码
  await validCode.destroy();

  res.status(201).json({ message: "注册成功", token: generateToken(newUser) });
});

//  用户登录
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "用户不存在" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "密码错误" });

  res.json({ message: "登录成功", token: generateToken(user) });
});

//  获取用户信息（需要登录）
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "未提供 Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: ["id", "username", "email"] });

    if (!user) return res.status(404).json({ message: "用户不存在" });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Token 无效" });
  }
});

module.exports = router;