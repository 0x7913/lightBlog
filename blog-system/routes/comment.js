const express = require("express");
const { Comment, User, Post } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

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
                return res.status(400).json({ code: 400, msg: "父评论不存在" });
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
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;

    try {
        // 查询评论及其回复
        const comments = await Comment.findAll({
            where: { postId, parentId: null }, // 只查顶级评论
            attributes: ["id", "content", "createdAt", "replyToUsername"],
            include: [
                {
                    model: User,
                    attributes: ["id", "username", "avatar"]
                },
                {
                    model: Comment, 
                    as: "replies",
                    attributes: ["id", "content", "createdAt", "userId", "parentId", "replyToUsername"],
                    include: {
                        model: User,
                        attributes: ["id", "username", "avatar"]
                    }
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        const formattedComments = comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            userId: comment.User.id,
            username: comment.User.username,
            avatar: comment.User.avatar,
            replies: comment.replies.map(reply => ({
                id: reply.id,
                content: reply.content,
                createdAt: reply.createdAt,
                userId: reply.User.id,
                username: reply.User.username,
                avatar: reply.User.avatar,
                replyToUsername: reply.replyToUsername
            }))
        }));

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
