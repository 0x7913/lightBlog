#项目大致结构如下:  
📂 blog-frontend   #前端代码  
├── 📂 node_modules  
├── 📂 src  
├── ├── 📂api  
├── │   ├── request.js  
├── │   └── index.js  
│   ├── 📂 assets       #静态资源  
│   ├── 📂 components  
│   │   ├── Header.vue      #头部组件(注册登录弹窗)  
│   │   ├── PostList.vue    #文章列表组件  
│   │   └── PostItem.vue    #文章单项组件  
│   ├── 📂 views  
│   │   ├── Home.vue        #首页  
│   │   ├── PostDetail.vue  #文章详情页  
│   │   ├── Profile.vue     #个人页面（用户信息、我的文章）  
│   │   └── Create.vue      #文章发布页  
│   ├── 📂 router  
│   │   └── index.js        #路由管理  
│   ├── 📂 store  
│   │   └── index.js        #状态管理  
│   ├── App.vue  
│   └── main.js  
├── vite.config.js  
│──package.json  
|  
📂 blog-system  
│── 📂 node_modules/       # 依赖包  
│── 📂 config/  
│   └── db.js          # 数据库连接  
│── 📂 models/  
│   ├── User.js        # 用户模型  
│   ├── VerificationCode.js  # 验证码模型  
│   ├── Post.js        # 文章模型  
│   ├── Comment.js     # 评论模型  
│   └── Image.js       # 图片模型  
│── 📂 routes/  
│   ├── auth.js        # 认证相关 API（注册、登录、验证码）  
│   ├── post.js        # 文章相关 API  
│   ├── comment.js     # 评论相关 API  
│   └── likeFavorite.js   # 点赞收藏相关 API  
│── 📂 middleware/  
│   ├── authMiddleware.js   # 认证中间件  
│── 📂 uploads/        # 存储上传的图片  
│   ├── avatars/       # 存放用户头像  
|   └── posts/         # 存放文章图片  
│── .env               # 配置文件（数据库、邮件等）  
│── server.js          # 入口文件  
└── package.json       # 依赖管理  


#后端api接口
POST /api/auth/send-code —— 发送邮箱验证码
POST /api/auth/register —— 注册用户
POST /api/auth/login —— 用户登录
GET /api/auth/me —— 获取当前用户信息（需要登录）


#运行命令  
cd blog-system  
npm install  
node server.js  
#新建终端  
cd blog-frontend  
npm install  
npm run dev  

#方案
直接进入主页面，不管是否登录都可以浏览文章。
判断 localStorage 里是否有 token：
有 token：自动获取用户信息，显示“已登录”状态。
无 token：显示“登录 / 注册”按钮。
在评论、发布文章时检查登录：
如果 token 为空，弹出提示框要求登录。
如果 token 存在，正常提交数据。

现在还有个人资料，标签功能，管理文章功能，搜索功能
个人资料分为上下两部分，上面是头像，用户名，简介等
下方分为左右两部分，左边为目录，显示我的文章，点赞，收藏，最近评论等
右边就显示对应目录的内容，点击可以进入到详情页，
个人资料中可以添加个人简介，默认显示暂无简介
需要修改可以点击编辑跳转到设置中修改

3主页中的积极讨论
2标签功能
4个人页面的列表布局是否需要更改
1评论的点赞功能
