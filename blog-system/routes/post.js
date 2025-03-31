const express = require("express");
const { Post, User, Comment, UserLikes, UserFavorites } = require("../models"); 
const { Op, Sequelize } = require('sequelize');
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

// 发布文章接口
router.post('/publish', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        // 校验标题和内容
        if (!title || !content) {
            return res.status(400).json({ code: 400, msg: '标题和内容不能为空' });
        }

        // 创建文章
        const newPost = await Post.create({
            title,
            content,
            userId: req.user.id,  // 使用 authMiddleware 添加的用户 ID
        });

        res.status(201).json({
            code: 0,
            msg: '文章发布成功',
            data: {
                id: newPost.id
            }
        });
    } catch (error) {
        console.error("发布文章失败:", error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
});

/**
 * 分页加载文章列表，返回评论数量
 * @route GET /api/post/list
 * @queryParam {number} page - 当前页码（从1开始）
 * @queryParam {number} limit - 每次加载数量（默认10）
 */
router.get('/list', async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        const offset = (page - 1) * limit;

        // 查询文章列表，同时统计评论、点赞和收藏数量
        const posts = await Post.findAll({
            attributes: [
                'id',
                'title',
                'createdAt',
                // 统计评论数
                [Sequelize.literal('(SELECT COUNT(*) FROM Comments WHERE Comments.postId = Post.id)'), 'commentCount'],
                // 统计点赞数
                [Sequelize.literal('(SELECT COUNT(*) FROM user_likes WHERE user_likes.postId = Post.id)'), 'likeCount'],
                // 统计收藏数
                [Sequelize.literal('(SELECT COUNT(*) FROM user_favorites WHERE user_favorites.postId = Post.id)'), 'favoriteCount']
            ],
            include: [
                {
                    model: User,
                    attributes: ['username', 'avatar']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            raw: true,
            nest: true
        });

        // 针对每篇文章检查当前登录用户是否已点赞或收藏
        const result = await Promise.all(posts.map(async (post) => {
            let userLiked = false;
            let userFavorited = false;
            if (req.user) {
                // 直接查询关联表而不是 Post.count 以优化性能
                userLiked = await User.findOne({
                    include: [{
                        model: Post,
                        as: 'LikedPosts',
                        where: { id: post.id }
                    }],
                    where: { id: req.user.id },
                    limit: 1
                }) !== null;

                userFavorited = await User.findOne({
                    include: [{
                        model: Post,
                        as: 'FavoritedPosts',
                        where: { id: post.id }
                    }],
                    where: { id: req.user.id },
                    limit: 1
                }) !== null;
            }

            return {
                id: post.id,
                title: post.title,
                author: post.User.username,
                avatar: post.User.avatar,
                createdAt: post.createdAt,
                commentCount: post.commentCount,
                likeCount: post.likeCount,
                favoriteCount: post.favoriteCount,
                userLiked,
                userFavorited
            };
        }));

        res.json({
            code: 0,
            msg: '文章列表加载成功',
            data: {
                posts: result,
                hasMore: result.length === limit
            }
        });

    } catch (error) {
        console.error("加载文章列表失败:", error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
});

/**
 * 获取文章详情页
 * @route GET /api/post/:id
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 查询文章详情，包含作者信息
        const post = await Post.findByPk(id, {
            include: [
                {
                    model: User,      // 作者信息
                    attributes: ['username', 'avatar']
                }
            ],
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt', 'userId']
        });

        if (!post) {
            return res.status(404).json({ code: 404, msg: '文章不存在' });
        }

        // 统计评论、点赞和收藏数量
        const commentCount = await Comment.count({ where: { postId: id } });
        const likeCount = await UserLikes.count({ where: { postId: id } });
        const favoriteCount = await UserFavorites.count({ where: { postId: id } });

        // 如果用户登录，判断当前用户是否已点赞或收藏
        let userLiked = false;
        let userFavorited = false;
        if (req.user) {
            userLiked = await UserLikes.findOne({
                where: { postId: id, userId: req.user.id }
            }) !== null;
            userFavorited = await UserFavorites.findOne({
                where: { postId: id, userId: req.user.id }
            }) !== null;
        }

        const result = {
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            userId: post.userId,              // 文章作者ID
            username: post.User.username,     // 作者用户名
            avatar: post.User.avatar,         // 作者头像
            commentCount,
            likeCount,
            favoriteCount,
            userLiked,
            userFavorited
        };

        res.status(200).json({
            code: 0,
            msg: '文章详情获取成功',
            data: result
        });
    } catch (error) {
        console.error('获取文章详情失败:', error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
});
module.exports = router;
