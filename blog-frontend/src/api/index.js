import request from './request';

// 认证相关
// 发送验证码
export const sendCode = async (email) => {
  return await request.post('/auth/send-code', { email });
};

// 注册
export const register = async (data) => {
  return await request.post('/auth/register', data);
};

// 登录
export const login = async (data) => {
  return await request.post('/auth/login', data);
};

// 获取用户信息（需要登录）
export const getUserInfo = async () => {
  return await request.get('/auth/me');
};

// 上传头像（返回头像 URL）
export const uploadAvatar = async (formData) => {
  return await request.post("/auth/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 更新用户信息（前端传入 avatar URL）
export const updateUserInfo = async (data) => {
  return await request.put("/auth/update-profile", data);
};

// 文章相关接口
// 上传文章图片（返回头像 URL）
export const uploadPostImage = async (formData) => {
  return await request.post("/post/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

//发布文章
export const createPost = async (data) => {
  return await request.post('/post/publish', data);
};

// 获取文章列表
export const getPostList = async (page = 1, limit = 10) => {
  return await request.get(`/post/list?page=${page}&limit=${limit}`);
};

// 获取文章详情
export const getPostDetail = async (postId) => {
  return await request.get(`/post/${postId}`);
};
// 获取当前登录用户的文章
export const getMyPostList = async (page = 1, limit = 20) => {
  return await request.get(`/post/myPostList?page=${page}&limit=${limit}`);
};
// 获取指定用户发布的文章
export const getUserPostList = async (userId, page = 1, limit = 20) => {
  return await request.get(`/post/user/${userId}?page=${page}&limit=${limit}`);
};

// 评论相关接口
// 发表评论
export const createComment = async (postId, content, parentId = null, replyToUsername = null) => {
  return await request.post(`/comment/${postId}`, { content, parentId, replyToUsername });
};

// 获取文章评论列表
export const getCommentList = async (postId) => {
  return await request.get(`/comment/${postId}`);
};

// 删除评论
export const deleteComment = async(commentId) => {
  return await request.delete(`/comment/${commentId}`);
};

// 点赞或取消点赞（需要登录）
export const toggleLike = async (postId) => {
  return await request.post(`/likeFavorite/like/${postId}`);
};

// 收藏或取消收藏（需要登录）
export const toggleFavorite = async (postId) => {
  return await request.post(`/likeFavorite/favorite/${postId}`);
};
