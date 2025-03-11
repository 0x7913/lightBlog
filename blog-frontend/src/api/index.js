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

// 更新用户信息（支持修改用户名和头像）
export const updateUserInfo = async (data) => {
  return await request.put('/auth/update-profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }, // 适用于文件上传
  });
};

// // 文章相关接口
// export const getPosts = async () => {
//   return await request.get('/post');
// };

// export const getPostById = async (id) => {
//   return await request.get(`/post/${id}`);
// };

// export const createPost = async (data) => {
//   return await request.post('/post', data);
// };

// export const deletePost = async (id) => {
//   return await request.delete(`/post/${id}`);
// };

// // 评论相关接口
// export const getComments = async (postId) => {
//   return await request.get('/comment', { params: { postId } });
// };

// export const addComment = async (postId, content) => {
//   return await request.post('/comment', { postId, content });
// };

// export const deleteComment = async (id) => {
//   return await request.delete(`/comment/${id}`);
// };