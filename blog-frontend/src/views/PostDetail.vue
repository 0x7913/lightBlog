<template>
  <div class="container2" ref="containerRef">
    <div class="left"></div>
    <div class="center">
      <div class="main-content" v-if="post">
        <div class="post-top">
          <img :src="post.author.avatar ? 'http://localhost:5000' + post.author.avatar : Avatar" alt="用户头像"
            class="post-avatar" />
          <div>
            <div class="post-author">{{ post.author.username }}</div>
            <div class="post-time">{{ formatDate(post.createdAt) }}</div>
          </div>
        </div>
        <h1>{{ post.title }}</h1>
        <div class="content markdown-body" v-html="renderedContent"></div>
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

const route = useRoute();
const post = ref(null);

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
    } else {
      console.error("加载文章失败:", res.msg);
    }
  } catch (error) {
    console.error("加载文章详情出错:", error);
  }
};

onMounted(() => {
  loadPostDetail();
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
      /* 代码块背景色 */
      color: #abb2bf;
      /* 代码颜色 */
      padding: 15px;
      overflow-x: auto;
      border-radius: 4px;

      /* ✅ 去掉代码块内的行内代码样式 */
      code {
        background: transparent !important;
        /* 去除背景色 */
        color: inherit !important;
        /* 继承代码块颜色 */
        padding: 0 !important;
        /* 去除内边距 */
        border-radius: 0 !important;
        /* 去除圆角 */
        font-weight: normal !important;
        /* 恢复字体权重 */
      }
    }

    /* ✅ 普通行内代码样式 */
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
</style>