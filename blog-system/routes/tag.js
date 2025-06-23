// routes/tag.js
const express = require("express");
const router = express.Router();
const { Tag, Post, sequelize } = require("../models");
const { Op } = require("sequelize");

// 输入关键词搜索标签
router.get("/search", async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.json({ code: 0, data: [] });
    const tags = await Tag.findAll({
        where: {
            name: { [Op.like]: `%${keyword}%` }
        },
        limit: 10
    });
    res.json({ code: 0, data: tags, msg: '搜索标签成功'});
});

// 获取所有标签及使用次数
router.get("/alltag", async (req, res) => {
    try {
        const tagCounts = await Tag.findAll({
            attributes: [
                "id",
                "name",
                [sequelize.fn("COUNT", sequelize.col("Posts.id")), "count"]
            ],
            include: [
                {
                    model: Post,
                    as: "Posts",
                    attributes: [],
                    through: { attributes: [] }
                }
            ],
            group: ["Tag.id"],
            order: [[sequelize.literal("count"), "DESC"]]
        });

        const data = tagCounts.map(tag => ({
            id: tag.id,
            name: tag.name,
            count: Number(tag.getDataValue("count"))
        }));

        res.json({ code: 0, data, msg: '获取标签成功' });
    } catch (err) {
        console.error("获取标签失败：", err);
        res.status(500).json({ code: 500, msg: "服务器错误" });
    }
});

module.exports = router;
