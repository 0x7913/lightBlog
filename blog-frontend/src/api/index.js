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

// 获取指定用户信息
export const getUserInfoById = (userId) => {
  return request.get(`/auth/user/userInfo-${userId}`);
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
  return await request.post('/post/publishPost', data);
};

// 获取文章列表
export const getPostList = async (page = 1, limit = 20, tags = []) => {
  let url = `/post/list?page=${page}&limit=${limit}`;
  if (tags.length) {
    url += `&tags=${encodeURIComponent(tags.join(','))}`;
  }
  return await request.get(url);
};

// 获取评论最多的前十篇文章
export const getMostCommentedPosts = async () => {
  return await request.get('/post/most-commented');
};

// 修改文章
export const updatePost = async (postId, data) => {
  return await request.put(`/post/updatePost-${postId}`, data);
};

// 删除文章
export const deletePost = async (postId) => {
  return await request.delete(`/post/deletePost-${postId}`);
};

// 获取文章详情
export const getPostDetail = async (postId) => {
  return await request.get(`/post/getPostDetail-${postId}`);
};

// 获取指定用户发布的所有文章（无分页）
export const getAllPostsByUser = async (userId) => {
  return await request.get(`/post/user/${userId}/allPosts`);
};


// 获取当前登录用户的文章
export const getMyPostList = async (page = 1, limit = 20) => {
  return await request.get(`/post/myPostList?page=${page}&limit=${limit}`);
};

// 获取指定用户发布的文章
export const getUserPostList = async (userId, page = 1, limit = 20) => {
  return await request.get(`/post/userPostList/userPost-${userId}?page=${page}&limit=${limit}`);
};

// 获取当前登录用户点赞的文章
export const getMyLikedPostList = async (page = 1, limit = 20) => {
  return await request.get(`/post/myLikedPosts?page=${page}&limit=${limit}`);
};

// 获取指定用户点赞的文章
export const getUserLikedPostList = async (userId, page = 1, limit = 20) => {
  return await request.get(`/post/userLikedPosts/likedPosts-${userId}?page=${page}&limit=${limit}`);
};

// 获取当前登录用户收藏的文章
export const getMyFavoritedPostList = async (page = 1, limit = 20) => {
  return await request.get(`/post/myFavoritedPosts?page=${page}&limit=${limit}`);
};

// 获取指定用户收藏的文章
export const getUserFavoritedPostList = async (userId, page = 1, limit = 20) => {
  return await request.get(`/post/userFavoritedPosts/favoritedPost-${userId}?page=${page}&limit=${limit}`);
};

// 评论相关接口
// 发表评论
export const createComment = async (postId, content, parentId = null, replyToUsername = null) => {
  return await request.post(`/comment/publishComment-${postId}`, { content, parentId, replyToUsername });
};

// 获取文章评论列表
export const getCommentList = async (postId) => {
  return await request.get(`/comment/getComments-${postId}`);
};

// 获取当前登录用户的评论
export const getMyCommentList = async (page = 1, limit = 20) => {
  return await request.get(`/comment/myComments?page=${page}&limit=${limit}`);
};

// 获取指定用户的评论
export const getUserCommentList = async (userId, page = 1, limit = 20) => {
  return await request.get(`/comment/userComments/userComments-${userId}?page=${page}&limit=${limit}`);
};

// 点赞或取消点赞评论
export const toggleCommentLike = async (commentId) => {
  return await request.post(`/comment/like/liked-${commentId}`);
};

// 删除评论
export const deleteComment = async(commentId) => {
  return await request.delete(`/comment/deleteComment-${commentId}`);
};

// 点赞或取消点赞（需要登录）
export const toggleLike = async (postId) => {
  return await request.post(`/likeFavorite/like/liked-${postId}`);
};

// 收藏或取消收藏（需要登录）
export const toggleFavorite = async (postId) => {
  return await request.post(`/likeFavorite/favorite/favorited-${postId}`);
};

// 搜索已有标签（输入关键字）
export const searchTags = async (keyword) => {
  return await request.get('/tag/search', { params: { keyword } });
};

// 获取所有标签
export const getAllTags = async () => {
  return await request.get('/tag/alltag');
};
