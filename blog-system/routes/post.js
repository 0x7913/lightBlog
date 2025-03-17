const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 确保 uploads/posts 目录存在
const uploadDir = path.join(__dirname, "../uploads/posts");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 Multer 存储位置和文件命名规则
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = uuidv4() + ext;
        cb(null, filename);
    }
});

// 过滤文件类型（仅允许图片）
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed!"), false);
    }
};

// 配置上传限制
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 限制 5MB
});

// 文章图片上传接口
router.post("/upload-image",authMiddleware, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.json({ code: 400, data: null, msg: "请上传图片文件" });
        }

        const fileUrl = `/uploads/posts/${req.file.filename}`;
        res.json({ code: 0, data: { url: fileUrl }, msg: "" });
    } catch (error) {
        res.json({ code: 500, data: null, msg: "服务器错误" });
    }
});

module.exports = router;
