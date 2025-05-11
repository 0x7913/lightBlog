//入口
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require("./routes/auth");
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const likeFavoriteRoutes = require('./routes/likeFavorite');
const tagRoutes = require("./routes/tag");

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/likeFavorite", likeFavoriteRoutes);
app.use("/api/tag", tagRoutes);

// 监听端口
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
