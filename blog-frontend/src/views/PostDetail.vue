<template>
  <div class="container2" ref="containerRef">
    <div class="left"></div>
    <div class="center">
      <div class="main-content" v-if="post">
        <div class="post-top">
          <img :src="post.avatar ? 'http://localhost:5000' + post.avatar : Avatar" alt="用户头像" class="post-avatar" />
          <div>
            <div class="post-author">{{ post.username }}</div>
            <div class="post-time">{{ formatDate(post.createdAt) }}</div>
          </div>
        </div>
        <h1>{{ post.title }}</h1>
        <div class="content markdown-body" v-html="renderedContent"></div>
      </div>
      <!-- 评论区域 -->
      <div class="main-comment">
        <h2>评论（{{ commentCount }}）</h2>

        <!-- 发表评论 -->
        <div class="comment-form">
          <textarea v-model="newComment" placeholder="发表你的评论..." class="comment-input"></textarea>
          <div class="comment-btn-container">
            <button @click="submitComment" :disabled="!newComment" class="submit-btn">
              发布评论
            </button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list" v-if="comments.length">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-top">
              <img :src="comment.avatar ? 'http://localhost:5000' + comment.avatar : Avatar" alt="用户头像"
                class="comment-avatar" />
              <div class="comment-info">
                <div style="border: 1px solid #f0f0f0; border-radius: 4px;padding: 10px;">
                  <div class="comment-detail">
                    <div>
                      <div class="comment-author">{{ comment.username }}</div>
                    </div>
                    <!-- 删除评论 -->
                    <div class="dropdown-container" v-if="canDelete(comment)" @click.stop="toggleDropdown(comment.id)">
                      <div class="menu-icon" :class="{ 'menu-hover': dropdownId === comment.id }">
                        <Icon icon="codicon:ellipsis" width="16" height="16" />
                      </div>
                      <!-- 下拉框 -->
                      <div v-if="dropdownId === comment.id" class="dropdown-menu">
                        <button @click="deleteComment(comment.id)" class="dropdown-item">🗑️ 删除</button>
                      </div>
                    </div>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex;gap: 20px;">
                      <div class="comment-upvote">点赞</div>
                      <div class="comment-reply" @click="toggleReply(comment.id)">回复</div>
                    </div>
                    <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
                  </div>
                </div>
                <div v-if="replyingCommentId[comment.id]" class="comment-form">
                  <textarea v-model="replyComment" placeholder="输入你的回复..." class="comment-input"></textarea>
                  <div class="comment-btn-container">
                    <button @click="submitReply(comment.id)" :disabled="!replyComment" class="submit-btn">
                      发布评论
                    </button>
                  </div>
                </div>
                <!-- 回复评论显示 -->
                <div v-if="comment.replies && comment.replies.length">
                  <div v-for="reply in comment.replies" :key="reply.id" class="comment-item">
                    <div class="comment-top">
                      <img :src="reply.avatar ? 'http://localhost:5000' + reply.avatar : Avatar" alt="用户头像"
                        class="comment-avatar" />
                      <div class="comment-info">
                        <div style="border: 1px solid #f0f0f0; border-radius: 4px;padding: 10px;">
                          <div class="comment-detail">
                            <div class="comment-author">
                              {{ reply.username }}
                              <span v-if="reply.replyToUsername">回复 {{ reply.replyToUsername
                                }}</span>
                            </div>
                            <div class="dropdown-container" v-if="canDelete(reply)"
                              @click.stop="toggleDropdown(reply.id)">
                              <div class="menu-icon" :class="{ 'menu-hover': dropdownId === reply.id }">
                                <Icon icon="codicon:ellipsis" width="16" height="16" />
                              </div>
                              <!-- 下拉框 -->
                              <div v-if="dropdownId === reply.id" class="dropdown-menu">
                                <button @click="deleteComment(reply.id)" class="dropdown-item">🗑️ 删除</button>
                              </div>
                            </div>
                          </div>
                          <p class="comment-content">{{ reply.content }}</p>
                          <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex;gap: 20px;">
                              <div class="comment-upvote">点赞</div>
                              <div class="comment-reply" @click="toggleReply(reply.id, reply.username)">回复</div>
                            </div>
                            <div class="comment-time">{{ formatDate(reply.createdAt) }}</div>
                          </div>
                        </div>
                        <div v-if="replyingCommentId[reply.id]" class="comment-form">
                          <textarea v-model="replyComment" placeholder="输入你的回复..." class="comment-input"></textarea>
                          <div class="comment-btn-container">
                            <button @click="submitReply(comment.id, reply.username)" :disabled="!replyComment"
                              class="submit-btn">
                              发布评论
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 没有评论时的提示 -->
        <div v-else class="no-comment">暂无评论，快来抢沙发吧！</div>
      </div>

    </div>
    <div class="right"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import * as BlogApi from "@/api";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Avatar from "@/assets/avatar/avatar.png";
import { ElMessageBox, ElMessage } from "element-plus";

const route = useRoute();
const post = ref(null);
const comments = ref([]);         // 存储评论列表
const newComment = ref("");        // 新评论内容
const commentCount = ref();        // 评论总数
const replyComment = ref(""); // 回复输入框
const replyingCommentId = ref({}); // 记录当前正在回复的评论 ID

// 切换回复框的显示
const toggleReply = (commentId, replyToUsername = null) => {
  // 如果当前点击的是已展开的回复框，则关闭
  if (replyingCommentId.value[commentId]) {
    replyingCommentId.value = {};  // 关闭所有输入框
    replyComment.value = "";
  } else {
    replyingCommentId.value = { [commentId]: true };  // 只展开当前的输入框
    replyComment.value = "";
  }
};

// 用于标记当前展开的评论 ID
const dropdownId = ref(null);

// 切换下拉菜单显示/隐藏
const toggleDropdown = (commentId) => {
  dropdownId.value = dropdownId.value === commentId ? null : commentId;
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  // 如果点击区域不在菜单内，关闭菜单
  if (!event.target.closest(".dropdown-container")) {
    dropdownId.value = null;
  }
};

// 判断当前用户是否有权限删除
const canDelete = (comment) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));  // 获取当前登录用户信息
  if (!userInfo || !userInfo.id) return false;
  return userInfo.id === comment.userId || userInfo.id === post.value.userId;
};

// 将 Markdown 转换为安全的 HTML
const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return "";
  const rawHtml = marked(post.value.content);
  return DOMPurify.sanitize(rawHtml);  // 防止 XSS 注入
});

// 加载文章详情
const loadPostDetail = async () => {
  const postId = route.params.id;

  try {
    const res = await BlogApi.getPostDetail(postId);
    if (res.code === 0) {
      post.value = res.data;
      commentCount.value = res.data.commentCount;
      loadComments();
    } else {
      console.error("加载文章失败:", res.msg);
    }
  } catch (error) {
    console.error("加载文章详情出错:", error);
  }
};

// 加载评论
const loadComments = async () => {
  const postId = route.params.id;

  try {
    const res = await BlogApi.getCommentList(postId);
    if (res.code === 0) {
      comments.value = res.data;
    } else {
      console.error("加载评论失败:", res.msg);
    }
  } catch (error) {
    console.error("加载评论出错:", error);
  }
};

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning("评论内容不能为空");
    return;
  }

  try {
    const res = await BlogApi.createComment(post.value.id, newComment.value);
    if (res.code === 0) {
      ElMessage.success("评论发布成功");
      commentCount.value = res.data.commentCount;
      newComment.value = "";
      setTimeout(() => {
        loadComments();
      }, 300);  // 延迟加载评论列表
    } else {
      ElMessage.error(res.msg || "发布评论失败");
    }
  } catch (error) {
    console.error("发布评论失败:", error);
    ElMessage.error("服务器错误");
  }
};

// 提交回复
const submitReply = async (commentId, replyToUsername = null) => {
  if (!replyComment.value.trim()) {
    ElMessage.warning("回复内容不能为空");
    return;
  }

  try {
    const res = await BlogApi.createComment(
      post.value.id,
      replyComment.value,
      commentId,  // 被回复的评论ID
      replyToUsername  // 被回复的用户名
    );

    if (res.code === 0) {
      ElMessage.success("回复发布成功");
      commentCount.value = res.data.commentCount;
      replyingCommentId.value = {};  // 关闭所有输入框
      replyComment.value = "";
      loadComments();
    } else {
      ElMessage.error(res.msg || "回复失败");
    }
  } catch (error) {
    console.error("回复失败:", error);
    ElMessage.error("服务器错误");
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  ElMessageBox.confirm("确定要删除这条评论吗？", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      const res = await BlogApi.deleteComment(commentId);
      if (res.code === 0) {
        ElMessage.success("评论删除成功");
        commentCount.value = res.data.commentCount;
        loadComments();  // 重新加载评论
      } else {
        ElMessage.error(res.msg || "删除失败");
      }
    } catch (error) {
      console.error("删除评论失败:", error);
      ElMessage.error("服务器错误");
    }
  }).catch(() => {
    console.log("取消删除");
  });
};

onMounted(() => {
  loadPostDetail();
  document.addEventListener("click", handleClickOutside);
});

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<style lang="scss">
.container2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin: 0 10%;
  padding-top: 60px;
}

.left {
  flex: 1;
  border: #007bff 1px solid;
}

.center {
  flex: 10;
}

.right {
  flex: 3;
  border: #007bff 1px solid;
}

.main-content {
  padding: 32px 64px;
  border-radius: 4px;
  background-color: #ffffff;
  margin-bottom: 10px;

  h1 {
    white-space: normal;
    word-break: break-word;
  }

  .post-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .post-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .post-author {
      font-size: 14px;
      padding: 4px;
    }

    .post-time {
      font-size: 12px;
      padding: 0 4px;
      color: #666;
    }
  }

  .content {
    margin-top: 70px;
  }

  .markdown-body {
    line-height: 1.8;
    white-space: normal;
    word-break: break-word;

    a {
      color: #1e88e5;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
      border-bottom: 1px solid rgba(30, 136, 229, 0.5);
    }

    a:hover {
      color: #1565c0;
      border-bottom: 1px solid rgba(21, 101, 192, 0.7);
    }

    a:active {
      color: #0d47a1;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      object-fit: cover;
    }

    pre {
      background: #282c34;
      color: #abb2bf;
      padding: 15px;
      overflow-x: auto;
      border-radius: 4px;

      code {
        background: transparent !important;
        color: inherit !important;
        padding: 0 !important;
        border-radius: 0 !important;
        font-weight: normal !important;
      }
    }

    code {
      background-color: var(--gray-100);
      color: var(--tw-prose-code);
      padding: .15rem .3rem;
      font-weight: 500;
      border-radius: .25rem;
    }

    blockquote {
      border-left: 4px solid #ccc;
      padding-left: 1rem;
      color: #555;
    }

    .CodeMirror-scroll {
      overflow: hidden;
    }


    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    table th {
      background-color: #f4f4f4;
      color: #333;
      font-weight: bold;
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
  }
}

.main-comment {
  padding: 32px 64px;
  border-radius: 4px;
  background-color: #ffffff;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;

  .comment-input {
    height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    outline: none;
    font-size: 16px;
    transition: border 0.2s;

    &:focus {
      border: 1px solid #007bff;
    }
  }

  .comment-btn-container {
    display: flex;
    justify-content: flex-end;

    .submit-btn {
      padding: 8px 16px;
      font-size: 14px;
      color: #fff;
      background-color: #007bff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s;

      &:hover {
        background-color: #0056b3;
      }

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }
  }
}

/* 评论列表样式 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .comment-item {
    padding-bottom: 15px;
    margin-bottom: 15px;

    .comment-top {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 10px;

      .comment-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        padding: 10px 0;
      }

      .comment-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;


        .comment-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;

          .menu-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;

            &:hover {
              background: #f6f6f6;
            }
          }

          .menu-hover {
            background: #f6f6f6;
          }

          .dropdown-container {
            position: relative;
            display: inline-block;

            .dropdown-menu {
              position: absolute;
              top: 40px;
              right: 0;
              background: #fff;
              border: 1px solid #ccc;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              z-index: 10;
              border-radius: 4px;
              min-width: 100px;
              padding: 5px 0;
            }

            .dropdown-item {
              display: block;
              width: 100%;
              padding: 8px 12px;
              color: #333;
              text-align: left;
              font-size: 14px;
              cursor: pointer;
              border: none;
              background: transparent;

              &:hover {
                background: #f6f6f6;
              }
            }
          }
        }

        .comment-author {
          font-weight: bold;
          font-size: 14px;
        }

        .comment-upvote {
          font-size: 12px;
          color: #888;
          padding: 10px;
          cursor: pointer;
          border-radius: 8px;

          &:hover {
            background: #f6f6f6;
          }
        }

        .comment-reply {
          font-size: 12px;
          color: #888;
          padding: 10px;
          cursor: pointer;
          border-radius: 8px;

          &:hover {
            background: #f6f6f6;
          }
        }

        .comment-time {
          font-size: 12px;
          color: #888;
          padding: 10px;
        }

        .comment-content {
          margin-top: 10px;
          font-size: 14px;
          line-height: 1.6;
          white-space: normal;
          word-break: break-word;
          white-space: pre-wrap;
        }
      }

    }

  }

  .no-comment {
    text-align: center;
    color: #aaa;
  }
}
</style>