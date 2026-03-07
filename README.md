
# lightBlog

项目大致结构如下:
📂 blog-frontend   #前端代码  
│   📂 node_modules  
│   📂 src  
│   │   📂api  
│   │   ├── request.js  
│   │   └── index.js  
│   │   📂 assets       #静态资源  
│   │   📂 components  
│   │   ├── Header.vue      #头部组件(注册登录弹窗)  
│   │   ├── MarkdownEditor.vue    #文章列表组件  
│   │   └── Tiptap.vue    #文章单项组件  
│   │   📂 composables  
│   │   └── useTagColor.js      #标签颜色库  
│   │   📂 views  
│   │   ├── Setting.vue     #设置页面  
│   │   ├── Home.vue        #首页  
│   │   ├── PostDetail.vue  #文章详情页  
│   │   ├── Profile.vue     #个人页面（用户信息、我的文章）  
│   │   └── Create.vue      #文章发布页  
│   │   📂 router  
│   │   └── index.js        #路由管理  
│   │   📂 store  
│   │   └── index.js        #状态管理  
│   │   📂 utils  
│   │   └── eventBus.js  
│   │   App.vue  
│   │   main.js  
│   index.html  
│   jsconfig.json  
│   package.json  
│   package-lock.json  
│   vite.config.js  
|  
📂 blog-system  
│   📂 node_modules/       # 依赖包  
│   📂 config/  
│   └── db.js          # 数据库连接  
│   📂 models/  
│   ├── User.js        # 用户模型  
│   ├── VerificationCode.js  # 验证码模型  
│   ├── Post.js        # 文章模型  
│   ├── Comment.js     # 评论模型  
│   └── Image.js       # 图片模型  
│   📂 routes/  
│   ├── auth.js        # 认证相关 API（注册、登录、验证码）  
│   ├── post.js        # 文章相关 API  
│   ├── comment.js     # 评论相关 API  
│   ├── tag.js         # 标签相关 API  
│   └── likeFavorite.js   # 点赞收藏相关 API  
│   📂 middleware/  
│   ├── authMiddleware.js   # 认证中间件  
│   📂 uploads/        # 存储上传的图片  
│   ├── avatars/       # 存放用户头像  
|   └── posts/         # 存放文章图片  
│   .env               # 配置文件（数据库、邮件等）  
│   server.js          # 入口文件  
│   package.json       # 依赖管理  

后端api接口  
POST /api/auth/send-code —— 发送邮箱验证码
POST /api/auth/register —— 注册用户
POST /api/auth/login —— 用户登录
GET /api/auth/me —— 获取当前用户信息（需要登录）

运行命令  
cd blog-system  
npm install  
node server.js

cd blog-frontend  
npm install  
npm run dev  
