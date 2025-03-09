//项目大致结构如下
📂 blog-system
│── 📂 node_modules/       # 依赖包
│── 📂 config/
│   ├── db.js          # 数据库连接
│── 📂 models/
│   ├── User.js        # 用户模型
│   ├── VerificationCode.js  # 验证码模型
│   ├── Post.js        # 文章模型
│   ├── Comment.js     # 评论模型
│   ├── Image.js       # 图片模型
│── 📂 routes/
│   ├── auth.js        # 认证相关 API（注册、登录、验证码）
│   ├── post.js        # 文章相关 API
│   ├── comment.js     # 评论相关 API
│   ├── upload.js      # 图片上传 API
│── 📂 middleware/
│   ├── authMiddleware.js  # 认证中间件
│── 📂 uploads/           # 存储上传的图片
│── .env               # 配置文件（数据库、邮件等）
│── server.js          # 入口文件
│── package.json       # 依赖管理
|
📂 blog-frontend  # 前端代码
├── 📂 node_modules
├── 📂 src
│   ├── 📂 assets
│   ├── 📂 components
│   │   ├── PostList.vue
│   │   ├── PostItem.vue
│   ├── 📂 views
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── PostDetail.vue
│   ├── 📂 router
│   │   ├── index.js
│   ├── 📂 store
│   │   ├── index.js
│   ├── App.vue
│   ├── main.js
├── vite.config.js
├── package.json


后端api接口
POST /api/auth/send-code —— 发送邮箱验证码
POST /api/auth/register —— 注册用户
POST /api/auth/login —— 用户登录
GET /api/auth/me —— 获取当前用户信息（需要登录）


//运行命令
cd blog-system
npm install
node server.js
//新建一个终端
cd blog-frontend
npm install
npm run dev
