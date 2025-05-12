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

const getEmailService = (email) => {
  if (email.endsWith("@qq.com")) return "qq";
  if (email.endsWith("@gmail.com")) return "gmail";
  if (email.endsWith("@163.com")) return "163";
  // if (email.endsWith("@outlook.com") || email.endsWith("@hotmail.com")) return "hotmail";
  return null;
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
    const emailService = getEmailService(email);
    if (!emailService) {
      return res.json({ code: 400, data: null, msg: "暂不支持该邮箱服务" });
    }

    let transporter;
    let fromAddress;
    // 根据不同的邮箱服务商配置邮件发送
    switch (emailService) {
      case 'qq':
        transporter = nodemailer.createTransport({
          service: 'qq',
          auth: {
            user: process.env.QQ_EMAIL_USER,
            pass: process.env.QQ_EMAIL_PASS,
          },
        });
        fromAddress = process.env.QQ_EMAIL_USER
        break;
      case 'gmail':
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_EMAIL_USER,
            pass: process.env.GMAIL_EMAIL_PASS,
          },
        });
        fromAddress = process.env.GMAIL_EMAIL_USER
        break;
      case '163':
        transporter = nodemailer.createTransport({
          service: '163',
          auth: {
            user: process.env.EMAIL_163_USER,
            pass: process.env.EMAIL_163_PASS,
          },
        });
        fromAddress = process.env.EMAIL_163_USER
        break;
      // case 'hotmail':
      //   transporter = nodemailer.createTransport({
      //     service: 'hotmail',
      //     auth: {
      //       user: process.env.HOTMAIL_EMAIL_USER,
      //       pass: process.env.HOTMAIL_EMAIL_PASS,
      //     },
      //   });
      //   fromAddress = process.env.HOTMAIL_EMAIL_USER
      //   break;
      default:
        return res.json({ code: 400, data: null, msg: "暂不支持该邮箱服务" });
    }


    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "你的验证码",
      text: `你的验证码是: ${code}, 5分钟内有效`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("邮件发送失败详细信息：", error);
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
      return res.json({ code: 409, data: null, msg: "用户名或邮箱已被注册" });
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
      attributes: [
        "id",
        "username",
        "email",
        "avatar",
        "birthday",
        "bio",
        "location",
        "createdAt"
      ]
    });

    if (!user) return res.json({ code: 404, data: null, msg: "用户不存在" });

    res.json({ code: 0, data: user, msg: "获取用户信息成功" });
  } catch (error) {
    res.json({ code: 401, data: null, msg: "Token 无效" });
  }
});

// 通过用户 ID 获取用户信息（无需登录）
router.get("/user/userInfo-:id", optional, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.json({ code: 400, data: null, msg: "缺少用户 ID" });
    }

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "avatar",
        "birthday",
        "bio",
        "location",
        "createdAt"
      ]
    });

    if (!user) {
      return res.json({ code: 404, data: null, msg: "用户不存在" });
    }

    res.json({ code: 0, data: user, msg: "获取用户信息成功" });
  } catch (err) {
    console.error("获取用户信息失败:", err);
    res.json({ code: 500, data: null, msg: "服务器错误" });
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
    const { username, avatar, birthday, bio, location } = req.body; // 头像由前端上传后传 URL

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({ code: 404, data: null, msg: "用户不存在" });
    }

    // 更新信息（如果前端没传 `username` 或 `avatar`，就保持原值）
    user.username = username || user.username;
    user.avatar = avatar || user.avatar;
    user.birthday = birthday || user.birthday;
    user.bio = bio || user.bio;
    user.location = location || user.location;

    await user.save();

    res.json({ code: 0, data: true, msg: "更新用户信息成功" });
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({ code: 500, data: null, msg: "服务器错误" });
  }
});

module.exports = router;
