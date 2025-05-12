const express = require("express");
const { UserLikes, UserFavorites, Post } = require("../models");
const { authMiddleware, optional } = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * 点赞或取消点赞(需要登录)
 * @route POST /api/like/:postId
 */
router.post("/like/liked-:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ code: 404, msg: "文章不存在" });

        const existingLike = await UserLikes.findOne({ where: { userId, postId } });
        if (existingLike) {
            await existingLike.destroy();
            return res.json({ code: 0, msg: "取消点赞成功", data: { liked: false } });
        } else {
            await UserLikes.create({ userId, postId });
            return res.json({ code: 0, msg: "点赞成功", data: { liked: true } });
        }
    } catch (error) {
        console.error("点赞失败:", error);
        res.status(500).json({ code: 500, msg: "服务器错误" });
    }
});

/**
 * 收藏或取消收藏(需要登录)
 * @route POST /api/favorite/:postId
 */
router.post("/favorite/favorited-:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ code: 404, msg: "文章不存在" });

        const existingFavorite = await UserFavorites.findOne({ where: { userId, postId } });
        if (existingFavorite) {
            await existingFavorite.destroy();
            return res.json({ code: 0, msg: "取消收藏成功", data: { favorited: false } });
        } else {
            await UserFavorites.create({ userId, postId });
            return res.json({ code: 0, msg: "收藏成功", data: { favorited: true } });
        }
    } catch (error) {
        console.error("收藏失败:", error);
        res.status(500).json({ code: 500, msg: "服务器错误" });
    }
});

module.exports = router;
