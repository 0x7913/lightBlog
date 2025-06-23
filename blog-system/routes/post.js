const express = require("express");
const {Post, User, Comment, UserLikes, UserFavorites, Tag} = require("../models");
const {Op, Sequelize} = require('sequelize');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {v4: uuidv4} = require("uuid");
const {authMiddleware, optional} = require("../middleware/authMiddleware");

const router = express.Router();

// 确保 uploads/posts 目录存在
const uploadDir = path.join(__dirname, "../uploads/posts");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
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
    limits: {fileSize: 5 * 1024 * 1024} // 限制 5MB
});

// 文章图片上传接口
router.post("/upload-image", authMiddleware, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.json({code: 400, data: null, msg: "请上传图片文件"});
        }

        const fileUrl = `/uploads/posts/${req.file.filename}`;
        res.json({code: 0, data: {url: fileUrl}, msg: ""});
    } catch (error) {
        res.json({code: 500, data: null, msg: "服务器错误"});
    }
});

// routes/post.js
router.get("/user/:userId/allPosts", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.json({code: 400, data: null, msg: "缺少用户 ID"});
        }
        // 查询用户的最新 5 篇文章，并带上关联的标签信息
        const posts = await Post.findAll({
            where: {userId},
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'title', 'createdAt'],
            include: [
                {
                    model: Tag,
                    as: 'Tags',  // 关联别名
                    attributes: ['id', 'name']  // 返回标签的 id 和 name
                }
            ]
        });
        res.json({
            code: 0,
            data: posts,
            msg: "获取用户文章成功"
        });
    } catch (err) {
        console.error("获取用户文章失败：", err);
        res.json({
            code: 500,
            data: null,
            msg: "服务器错误"
        });
    }
});

/**
 * 获取当前登录用户的文章列表
 * @route GET /api/post/myPostList?page=1
 */
router.get('/myPostList', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const result = await Post.findAll({
            where: {userId},
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'], // 只返回这些字段
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.json({
            code: 0,
            msg: result.length === 0 ? '您尚未发布任何文章' : '文章列表加载成功',
            data: {
                posts: result,
                hasMore: result.length === limit,
            },
        });
    } catch (err) {
        console.error('获取我的文章失败:', err);
        res.status(500).json({
            code: 500,
            msg: '获取我的文章失败',
        });
    }
});

/**
 * 获取指定用户的文章列表
 * @route GET /api/post/user/:userId?page=1
 */
router.get('/userPostList/userPost-:userId', async (req, res) => {
    const {userId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const result = await Post.findAll({
            where: {userId},
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'], // 不包含 User 信息
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.json({
            code: 0,
            msg: result.length === 0 ? '该用户尚未发布任何文章' : '文章列表加载成功',
            data: {
                posts: result,
                hasMore: result.length === limit,
            },
        });
    } catch (err) {
        console.error('获取用户文章失败:', err);
        res.status(500).json({
            code: 500,
            msg: '获取用户文章失败',
        });
    }
});

/**
 * 获取当前登录用户点赞的文章列表
 * @route GET /api/post/myLikedPosts?page=1
 */
router.get('/myLikedPosts', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const user = await User.findByPk(req.user.id);
        const likedPosts = await user.getLikedPosts({
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            joinTableAttributes: [], // 不返回中间表字段
        });

        res.json({
            code: 0,
            msg: likedPosts.length ? '点赞文章加载成功' : '您还未点赞任何文章',
            data: {
                posts: likedPosts,
                hasMore: likedPosts.length === limit,
            }
        });
    } catch (err) {
        console.error('获取点赞文章失败:', err);
        res.status(500).json({
            code: 500,
            msg: '获取点赞文章失败',
        });
    }
});

/**
 * 获取指定用户点赞的文章列表
 * @route GET /api/post/userLikedPosts/:userId?page=1
 */
router.get('/userLikedPosts/likedPosts-:userId', async (req, res) => {
    const {userId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                code: 404,
                msg: '用户不存在',
            });
        }

        const likedPosts = await user.getLikedPosts({
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            joinTableAttributes: [],
        });

        res.json({
            code: 0,
            msg: likedPosts.length ? '点赞文章加载成功' : '该用户未点赞任何文章',
            data: {
                posts: likedPosts,
                hasMore: likedPosts.length === limit,
            }
        });
    } catch (err) {
        console.error('获取指定用户点赞文章失败:', err);
        res.status(500).json({
            code: 500,
            msg: '获取指定用户点赞文章失败',
        });
    }
});

/**
 * 获取当前登录用户收藏的文章列表
 * @route GET /api/post/myFavoritedPosts?page=1
 */
router.get('/myFavoritedPosts', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const user = await User.findByPk(req.user.id);
        const favoritedPosts = await user.getFavoritedPosts({
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            joinTableAttributes: [], // 不返回中间表字段
        });

        res.json({
            code: 0,
            msg: favoritedPosts.length ? '收藏文章加载成功' : '您还未收藏任何文章',
            data: {
                posts: favoritedPosts,
                hasMore: favoritedPosts.length === limit,
            }
        });
    } catch (err) {
        console.error('获取收藏文章失败:', err);
        res.status(500).json({
            code: 500,
            msg: '获取收藏文章失败',
        });
    }
});

/**
 * 获取指定用户收藏的文章列表
 * @route GET /api/post/userFavoritedPosts/:userId?page=1
 */
router.get('/userFavoritedPosts/favoritedPost-:userId', async (req, res) => {
    const {userId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                code: 404,
                msg: '用户不存在',
            });
        }

        const favoritedPosts = await user.getFavoritedPosts({
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            joinTableAttributes: [],
        });

        res.json({
            code: 0,
            msg: favoritedPosts.length ? '收藏文章加载成功' : '该用户未收藏任何文章',
            data: {
                posts: favoritedPosts,
                hasMore: favoritedPosts.length === limit,
            }
        });
    } catch (err) {
        console.error('获取指定用户收藏文章失败:', err);
        res.status(500).json({
            code: 500,
            msg: '获取指定用户收藏文章失败',
        });
    }
});

// 发布文章接口
router.post('/publishPost', authMiddleware, async (req, res) => {
    try {
        const {title, content, tags = []} = req.body;
        if (!title || !content) {
            return res.status(400).json({code: 400, msg: '标题和内容不能为空'});
        }
        if (tags.length > 5) {
            return res.status(400).json({code: 401, msg: '最多只能选择5个标签'});
        }
        // 创建文章
        const newPost = await Post.create({
            title,
            content,
            userId: req.user.id
        });

        // 处理标签（查找已有的 + 创建新的）
        const tagInstances = [];
        for (const tagName of tags) {
            const [tag] = await Tag.findOrCreate({where: {name: tagName.trim()}});
            tagInstances.push(tag);
        }

        // 建立关联
        await newPost.setTags(tagInstances);
        res.status(201).json({
            code: 0,
            msg: '文章发布成功',
            data: {id: newPost.id}
        });
    } catch (error) {
        console.error("发布文章失败:", error);
        res.status(500).json({code: 500, msg: '服务器错误'});
    }
});

/**
 * 分页加载文章列表
 * @route GET /api/post/list
 * @queryParam {number} page - 当前页码（从1开始）
 * @queryParam {number} limit - 每次加载数量（默认20）
 * @queryParam {string} tags - 标签名称，多个标签以逗号分隔（可选）
 */
router.get('/list', optional, async (req, res) => {
    try {
        let {page = 1, limit = 20, tags, keyword} = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 20;
        const offset = (page - 1) * limit;

        // 解析标签筛选条件
        let tagFilter = [];
        if (tags && typeof tags === 'string') {
            tagFilter = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        const where = {};
        if (keyword && typeof keyword === 'string') {
            where.title = {
                [Sequelize.Op.like]: `%${keyword.trim()}%`
            };
        }

        // 构建查询条件
        const postQuery = {
            where,
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
                },
                {
                    model: Tag,
                    as: 'Tags',
                    attributes: ['name'],
                    through: {attributes: []},
                    ...(tagFilter.length > 0 ? {
                        where: {name: tagFilter}
                    } : {})
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true  // 避免标签过滤导致分页出错
        };

        const posts = await Post.findAll(postQuery);
        const result = await Promise.all(posts.map(async (post) => {
            let userLiked = false;
            let userFavorited = false;
            if (req.user) {
                userLiked = await UserLikes.count({
                    where: {userId: req.user.id, postId: post.id}
                }) > 0;
                userFavorited = await UserFavorites.count({
                    where: {userId: req.user.id, postId: post.id}
                }) > 0;
            }

            return {
                id: post.id,
                title: post.title,
                author: post.User.username,
                avatar: post.User.avatar,
                createdAt: post.createdAt,
                commentCount: post.getDataValue('commentCount'),
                likeCount: post.getDataValue('likeCount'),
                favoriteCount: post.getDataValue('favoriteCount'),
                tags: post.Tags?.map(t => t.name) || [],
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
        res.status(500).json({code: 500, msg: '服务器错误'});
    }
});

/**
 * 获取评论数量最多的前九篇文章（用于积极讨论）
 * @route GET /api/post/most-commented
 */
router.get('/most-commented', async (req, res) => {
    try {
        const topCommentedPosts = await Post.findAll({
            attributes: [
                'id',
                'title',
                [Sequelize.literal('(SELECT COUNT(*) FROM Comments WHERE Comments.postId = Post.id)'), 'commentCount']
            ],
            order: [[Sequelize.literal('commentCount'), 'DESC']],
            limit: 9,
            raw: true
        });

        res.json({
            code: 0,
            msg: '获取热门讨论文章成功',
            data: topCommentedPosts
        });
    } catch (error) {
        console.error('获取热门讨论文章失败:', error);
        res.status(500).json({code: 500, msg: '服务器错误'});
    }
});

/**
 * 修改文章
 * @route PUT /api/post/update:id
 */
router.put('/updatePost-:id', authMiddleware, async (req, res) => {
    const {id} = req.params;
    const {title, content, tags = []} = req.body;

    try {
        // 找到文章
        const post = await Post.findByPk(id, {
            include: [{model: Tag, as: 'Tags'}]
        });
        if (!post) {
            return res.status(404).json({code: 404, msg: '文章不存在'});
        }
        // 只有作者本人才能修改
        if (post.userId !== req.user.id) {
            return res.status(403).json({code: 403, msg: '无权限修改该文章'});
        }
        // 校验标题和内容
        if (!title || !content) {
            return res.status(400).json({code: 400, msg: '标题和内容不能为空'});
        }
        // 更新标题和内容
        await post.update({title, content});

        // 处理标签（创建不存在的标签，并关联）
        const tagInstances = await Promise.all(tags.map(async (tagName) => {
            const [tag] = await Tag.findOrCreate({where: {name: tagName.trim()}});
            return tag;
        }));

        await post.setTags(tagInstances); // 更新中间表 PostTags

        res.status(200).json({code: 0, msg: '文章修改成功'});
    } catch (error) {
        console.error('修改文章失败:', error);
        res.status(500).json({code: 500, msg: '服务器错误'});
    }
});

/**
 * 删除文章
 * @route DELETE /api/post/:id
 */
router.delete('/deletePost-:id', authMiddleware, async (req, res) => {
    const {id} = req.params;

    try {
        // 找到文章
        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({code: 404, msg: '文章不存在'});
        }
        // 只有作者本人才能删除
        if (post.userId !== req.user.id) {
            return res.status(403).json({code: 403, msg: '无权限删除该文章'});
        }
        // 删除文章
        await post.destroy();
        res.status(200).json({code: 0, msg: '文章删除成功'});
    } catch (error) {
        console.error('删除文章失败:', error);
        res.status(500).json({code: 500, msg: '服务器错误'});
    }
});

/**
 * 获取文章详情页
 * @route GET /api/post/:id
 */
router.get('/getPostDetail-:id', optional, async (req, res) => {
    const {id} = req.params;

    try {
        // 查询文章详情，包含作者信息
        const post = await Post.findByPk(id, {
            include: [
                {
                    model: User,      // 作者信息
                    attributes: ['username', 'avatar']
                },
                {
                    model: Tag,
                    as: 'Tags',
                    attributes: ['name'],
                    through: {attributes: []} // 不返回中间表数据
                }
            ],
            attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt', 'userId']
        });

        if (!post) {
            return res.status(404).json({code: 404, msg: '文章不存在'});
        }

        // 统计评论、点赞和收藏数量
        const commentCount = await Comment.count({where: {postId: id}});
        const likeCount = await UserLikes.count({where: {postId: id}});
        const favoriteCount = await UserFavorites.count({where: {postId: id}});

        // 如果用户登录，判断当前用户是否已点赞或收藏
        let userLiked = false;
        let userFavorited = false;
        if (req.user) {
            userLiked = await UserLikes.findOne({
                where: {postId: id, userId: req.user.id}
            }) !== null;
            userFavorited = await UserFavorites.findOne({
                where: {postId: id, userId: req.user.id}
            }) !== null;
        }

        const result = {
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            userId: post.userId,
            username: post.User.username,
            avatar: post.User.avatar,
            tags: post.Tags?.map(tag => tag.name) || [],
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
        res.status(500).json({code: 500, msg: '服务器错误'});
    }
});
module.exports = router;
