<template>
  <div class="container1" ref="containerRef">
    <div class="left"></div>
    <div class="center">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goToPostDetail(post.id)">
        <div class="post-top">
          <img :src="post.avatar ? 'http://localhost:5000' + post.avatar : Avatar" alt="用户头像" class="post-avatar" />
          <div>
            <div class="post-author">{{ post.author }}</div>
            <div class="post-time">{{ formatDate(post.createdAt) }}</div>
          </div>
        </div>
        <div class="post-content">
          <h3>{{ post.title }}</h3>
          <div>标签</div>
          <div class="post-active">
            <div style="display: flex; gap: 20px; align-items: center;">
              <div @click.stop="handleLike(post)" class="flex-center">
                <Icon icon="ic:sharp-favorite" width="17px" height="17px" :style="{ color: post.userLiked ? 'red' : '#fff' }" stroke-width="1"
                  stroke="#000" />
                {{ post.likeCount }}
                喜欢
              </div>
              <div class="flex-center">
                <Icon icon="gravity-ui:comment-fill" width="16px" height="16px" style="color: #fff" stroke-width="0.7"
                  stroke="#000" />
                {{ post.commentCount }}
                评论
              </div>
            </div>
            <div @click.stop="handleFavorite(post)" class="flex-center">
              {{ post.favoriteCount }}
              <!-- <Icon icon="clarity:favorite-solid" width="16px" height="16px" style="color: #fff" stroke-width="1"
                stroke="#000" /> -->
              <Icon icon="fontisto:favorite" width="16px" height="16px" :style="{ color: post.userFavorited ? 'black' : '#fff' }" stroke-width="1"
                stroke="#000" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!hasMore" class="no-more">没有更多文章了</div>
      <div ref="observerTarget" class="observer-target"></div>
    </div>
    <div class="right"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { usePostStore } from '@/store/index';
import Avatar from '@/assets/avatar/avatar.png'
import * as BlogApi from '@/api';
import { eventBus } from '@/utils/eventBus';

const store = usePostStore();
const posts = ref([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const containerRef = ref(null);
const observerTarget = ref(null); // 目标触发点
const router = useRouter();

let observer = null;
let timeoutId = null;  // 延迟加载的计时器
const DELAY = 300;     // 延迟时间（毫秒）

// 跳转到文章详情页
const goToPostDetail = (postId) => {
  router.push(`/post/${postId}`);
};

// 加载文章
const loadPosts = async () => {
  if (!hasMore.value || loading.value) return;

  loading.value = true;

  try {
    const res = await BlogApi.getPostList(page.value, 10);
    if (res.code === 0) {
      posts.value.push(...res.data.posts);
      hasMore.value = res.data.hasMore;
      page.value++;
      store.setPosts(posts.value);
      store.setPage(page.value);
      store.setHasMore(hasMore.value);
    }
  } catch (error) {
    console.error("加载文章失败:", error);
  } finally {
    loading.value = false;

    // 等待 DOM 渲染后再监听
    await nextTick(() => {
      initObserver();
    });
  }
};

// 初始化 IntersectionObserver
const initObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  if (!observerTarget.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore.value && !loading.value) {
        // 延迟触发加载
        if (timeoutId) {
          clearTimeout(timeoutId);  // 清除之前的计时器
        }
        timeoutId = setTimeout(() => {
          loadPosts();
        }, DELAY);
      }
    },
    {
      root: null,          // 视口为根
      rootMargin: '0px',   // 没有提前加载
      threshold: 1.0        // 完全可见时加载
    }
  );

  observer.observe(observerTarget.value);
};

const handleLike = async (post) => {
  try {
    const res = await BlogApi.toggleLike(post.id);
    if (res.code === 0) {
      await refreshPostStatus(post);
    }
  } catch (err) {
    console.error('点赞失败:', err);
  }
};

const handleFavorite = async (post) => {
  try {
    const res = await BlogApi.toggleFavorite(post.id);
    if (res.code === 0) {
      await refreshPostStatus(post);
    }
  } catch (err) {
    console.error('收藏失败:', err);
  }
};

// 刷新文章的状态
const refreshPostStatus = async (post) => {
  try {
    const res = await BlogApi.getPostDetail(post.id);
    if (res.code === 0) {
      const updatedPost = res.data;

      // 找到 posts 中对应项的索引，并替换为新的对象（强响应式）
      const index = posts.value.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts.value[index] = {
          ...posts.value[index],
          userLiked: updatedPost.userLiked,
          userFavorited: updatedPost.userFavorited,
          likeCount: updatedPost.likeCount,
          favoriteCount: updatedPost.favoriteCount
        };
      }
    }
  } catch (err) {
    console.error('刷新文章状态失败:', err);
  }
};

//TODO:后续将直接刷新页面，重新调用函数，不再使用pinia缓存
// 页面加载时触发
onMounted(() => {
  // 检查 Pinia 中是否有缓存
  if (store.posts.length > 0) {
    // 使用缓存数据
    posts.value = store.posts;
    page.value = store.page;
    hasMore.value = store.hasMore;

    nextTick(() => {
      window.scrollTo(0, store.scrollTop);
      initObserver();
    });
  } else {
    // 没有缓存数据，加载新文章
    loadPosts();
  }
  // 监听刷新事件
  eventBus.on('refresh-posts', () => {
    posts.value = [];
    page.value = 1;
    hasMore.value = true;
    loadPosts();
  });
});

// 监听滚动，保存滚动位置
const saveScrollPosition = () => {
  store.setScrollTop(window.scrollY);
};

// 监听页面滚动，保存位置
window.addEventListener('scroll', saveScrollPosition);

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  // 移除滚动监听
  window.removeEventListener('scroll', saveScrollPosition);
  eventBus.off('refresh-posts');
});
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');  // 月份补0
  const day = String(d.getDate()).padStart(2, '0');         // 日期补0
  return `${year}-${month}-${day}`;
};
</script>

<style lang="scss" scoped>
.container1 {
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
  flex: 3
}

.right {
  flex: 1.5;
  border: #007bff 1px solid;
}

.post-card {
  padding: 20px;
  border-radius: 4px;
  background-color: #ffffff;
  margin-bottom: 10px;
  cursor: pointer;

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

  .post-content {
    h3 {
      white-space: normal;
      word-break: break-word;
    }

    padding-left: 46px;

    .post-active {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      color: #666;
      font-size: 12px;
      .flex-center {
        display: flex;
        gap: 5px;
        align-items: center;
        padding: 4px 6px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
        user-select: none; // 禁止文本选中
        &:hover {
          background-color: #f6f6f6;
        }
      }
    }
  }
}

.load-more {
  text-align: center;
  cursor: pointer;
  padding: 10px;
  border: 1px solid #007bff;
  color: #007bff;
  border-radius: 4px;
}

.load-more:hover {
  background: #007bff;
  color: #fff;
}
</style>
