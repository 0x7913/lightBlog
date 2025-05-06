const express = require("express");
const { Comment, User, Post, CommentLike } = require("../models");
const { authMiddleware, optional } = require("../middleware/authMiddleware");
const router = express.Router();

// 获取当前登录用户的评论列表
router.get('/myComments', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const comments = await Comment.findAll({
            where: { userId: req.user.id },
            include: [{ model: Post, attributes: ['id', 'title'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            code: 0,
            msg: comments.length ? '评论加载成功' : '您尚未发表任何评论',
            data: {
                comments,
                hasMore: comments.length === limit
            }
        });
    } catch (err) {
        console.error('获取我的评论失败:', err);
        res.status(500).json({ code: 500, msg: '获取我的评论失败' });
    }
});

// 获取指定用户的评论列表
router.get('/userComments/:userId', async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ code: 404, msg: '用户不存在' });
        }

        const comments = await Comment.findAll({
            where: { userId },
            include: [{ model: Post, attributes: ['id', 'title'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            code: 0,
            msg: comments.length ? '评论加载成功' : '该用户暂无评论',
            data: {
                comments,
                hasMore: comments.length === limit
            }
        });
    } catch (err) {
        console.error('获取用户评论失败:', err);
        res.status(500).json({ code: 500, msg: '获取用户评论失败' });
    }
});

/**
 * 发布评论
 * @route POST /api/comment/:postId
 * @desc 需要登录
 */
router.post("/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content, parentId, replyToUsername } = req.body;  // 允许携带 parentId 和 replyToUsername

    if (!content.trim()) {
        return res.status(400).json({ code: 400, msg: "评论内容不能为空" });
    }

    try {
        // 检查文章是否存在
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ code: 404, msg: "文章不存在" });
        }

        // 如果是回复评论，检查父评论是否存在
        if (parentId) {
            const parentComment = await Comment.findByPk(parentId);
            if (!parentComment) {
                return res.status(404).json({ code: 404, msg: "父评论不存在" });
            }
        }

        // 创建评论或回复
        const comment = await Comment.create({
            content,
            postId,
            userId: req.user.id,
            parentId: parentId || null,
            replyToUsername: replyToUsername || null,
        });

        const commentCount = await Comment.count({
            where: { postId }
        });

        res.status(201).json({
            code: 0,
            msg: "评论发布成功",
            data: {
                commentCount,
            }
        });

    } catch (error) {
        console.error("发布评论失败:", error);
        res.status(500).json({ code: 500, msg: "服务器错误" });
    }
});
/**
 * 获取文章评论列表
 * @route GET /api/comment/:postId
 * @desc 不需要登录
 */
router.get("/:postId", optional, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user?.id;
    let likedCommentIds = [];

    try {
        // 获取用户点赞的评论 ID
        if (userId) {
            const likes = await CommentLike.findAll({
                where: { userId },
                attributes: ['commentId']
            });
            likedCommentIds = likes.map(like => like.commentId);
        }

        // 查顶级评论
        const topLevelComments = await Comment.findAll({
            where: { postId, parentId: null },
            include: [{
                model: User,
                attributes: ['id', 'username', 'avatar']
            }]
        });

        // 查每条顶级评论的点赞数、回复、以及回复点赞数
        const formattedComments = await Promise.all(topLevelComments.map(async (comment) => {
            const likeCount = await CommentLike.count({ where: { commentId: comment.id } });

            // 查子评论
            const replies = await Comment.findAll({
                where: { parentId: comment.id },
                include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
            });

            const formattedReplies = await Promise.all(replies.map(async (reply) => {
                const replyLikeCount = await CommentLike.count({ where: { commentId: reply.id } });
                return {
                    id: reply.id,
                    content: reply.content,
                    createdAt: reply.createdAt,
                    userId: reply.User.id,
                    username: reply.User.username,
                    avatar: reply.User.avatar,
                    replyToUsername: reply.replyToUsername,
                    likeCount: replyLikeCount,
                    liked: likedCommentIds.includes(reply.id)
                };
            }));
            formattedReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            return {
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                userId: comment.User.id,
                username: comment.User.username,
                avatar: comment.User.avatar,
                likeCount,
                liked: likedCommentIds.includes(comment.id),
                replies: formattedReplies
            };
        }));
        formattedComments.sort((a, b) => b.likeCount - a.likeCount);

        res.status(200).json({
            code: 0,
            msg: "评论加载成功",
            data: formattedComments
        });
    } catch (error) {
        console.error("加载评论失败:", error);
        res.status(500).json({ code: 500, msg: "服务器错误" });
    }
});

/**
 * 点赞或取消点赞评论
 * @route POST /api/comment/like/:commentId
 * @desc 登录后调用
 */
router.post('/like/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    try {
        const existing = await CommentLike.findOne({
            where: { userId, commentId }
        });

        if (existing) {
            // 已点赞 → 取消点赞
            await existing.destroy();
            return res.json({ code: 0, msg: '取消点赞成功', data: { liked: false } });
        } else {
            // 未点赞 → 点赞
            await CommentLike.create({ userId, commentId });
            return res.json({ code: 0, msg: '点赞成功', data: { liked: true } });
        }
    } catch (err) {
        console.error('切换评论点赞失败:', err);
        res.status(500).json({ code: 500, msg: '操作失败' });
    }
});

/**
 * 删除评论
 * @route DELETE /api/comment/:commentId
 * @desc 仅限作者和评论者
 */
router.delete("/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    try {
        const comment = await Comment.findByPk(commentId, {
            include: [{ model: Post, attributes: ["userId"] }]
        });

        if (!comment) {
            return res.status(404).json({ code: 404, msg: "评论不存在" });
        }

        const isCommentAuthor = comment.userId === userId;
        const isPostAuthor = comment.Post.userId === userId;

        if (!isCommentAuthor && !isPostAuthor) {
            return res.status(403).json({ code: 403, msg: "无权删除该评论" });
        }

        await comment.destroy();

        const commentCount = await Comment.count({
            where: { postId: comment.postId }
        });

        res.status(200).json({
            code: 0,
            data: { commentCount },
            msg: "评论删除成功"
        });

    } catch (error) {
        console.error("删除评论失败:", error);
        res.status(500).json({ code: 500, msg: "服务器错误" });
    }
});

module.exports = router;
