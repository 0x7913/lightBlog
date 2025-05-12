<template>
  <div class="container1" ref="containerRef">
    <div class="left">
      <div>
        <div v-for="(tag, index) in tags" :key="index" class="tag-item1">
          <el-check-tag
              :label="tag.name"
              :type="getTagType(tag.name)"
              :checked="selectedTags.includes(tag.name)"
              @change="handleTagClick(tag.name)"
          >
            #{{ tag.name }}
          </el-check-tag>
        </div>
      </div>
    </div>
    <div class="center">
      <template v-if="posts.length">
        <div v-for="post in posts" :key="post.id" class="post-card" @click="goToPostDetail(post.id)">
          <div class="post-top">
            <img :src="post.avatar ? 'http://localhost:5000' + post.avatar : Avatar" alt="用户头像"
                 class="post-avatar"/>
            <div>
              <div class="post-author">{{ post.author }}</div>
              <div class="post-time">{{ formatDate(post.createdAt) }}</div>
            </div>
          </div>
          <div class="post-content">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-tag">
              <el-tag
                  v-for="(tag, index) in post.tags"
                  :key="index"
                  :type="getTagType(tag)"
                  type="info"
                  class="tag-item"
              >
                #{{ tag }}
              </el-tag>
            </div>
            <div class="post-active">
              <div style="display: flex; gap: 20px; align-items: center;">
                <div @click.stop="handleLike(post)" class="flex-center">
                  <Icon icon="ic:sharp-favorite" width="17px" height="17px"
                        :style="{ color: post.userLiked ? 'red' : '#fff' }" stroke-width="1"
                        stroke="#000"/>
                  {{ post.likeCount }}
                  喜欢
                </div>
                <div class="flex-center">
                  <Icon icon="gravity-ui:comment-fill" width="16px" height="16px" style="color: #fff" stroke-width="0.7"
                        stroke="#000"/>
                  {{ post.commentCount }}
                  评论
                </div>
              </div>
              <div @click.stop="handleFavorite(post)" class="flex-center">
                <!--              {{ post.favoriteCount }}-->
                <Icon icon="fontisto:favorite" width="16px" height="16px"
                      :style="{ color: post.userFavorited ? 'black' : '#fff' }" stroke-width="1"
                      stroke="#000"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="empty-tip">暂无文章</div>
      </template>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!hasMore" class="no-more">没有更多文章了</div>
      <div ref="observerTarget" class="observer-target"></div>
    </div>
    <div class="right">
      <div class="right-container">
        <h3 style="padding-left: 20px">热门讨论</h3>
        <el-divider/>
        <div v-if="hotPosts.length">
          <div v-for="post in hotPosts" :key="post.id">
            <div class="info" @click="goToPostDetailFromHot(post.id)">
              <div class="title">{{ post.title }}</div>
              <div class="count">{{ post.commentCount }} 评论</div>
            </div>
            <el-divider/>
          </div>
        </div>
        <div v-else class="empty-tip">暂无热门讨论</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick} from 'vue';
import {useRouter} from 'vue-router';
import {usePostStore} from '@/store/index';
import Avatar from '@/assets/avatar/avatar.png'
import * as BlogApi from '@/api';
import {eventBus} from '@/utils/eventBus';
import {useTagColor} from '@/composables/useTagColor';

const store = usePostStore();
const hotPosts = ref([]);
const posts = ref([]);
const tags = ref([]);
const selectedTags = ref([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const containerRef = ref(null);
const observerTarget = ref(null); // 目标触发点
const router = useRouter();

let observer = null;
let timeoutId = null;  // 延迟加载的计时器
const DELAY = 300;     // 延迟时间（毫秒）
const {getTagType} = useTagColor();

// 跳转到文章详情页
const goToPostDetail = (postId) => {
  router.push(`/post/${postId}`);
};

// 加载文章
const loadPosts = async (reset = false) => {
  if (!hasMore.value || loading.value) return;

  if (reset) {
    posts.value = [];
    page.value = 1;
    hasMore.value = true;
  }

  loading.value = true;

  try {
    const res = await BlogApi.getPostList(page.value, 20, selectedTags.value);
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

const getAllTags = async () => {
  try {
    const res = await BlogApi.getAllTags();
    if (res.code === 0) {
      tags.value = res.data;
    } else {
      console.warn("标签获取失败：", res.message);
    }
  } catch (error) {
    console.error("获取标签出错：", error);
  }
}

const handleTagClick = (tagName) => {
  const index = selectedTags.value.indexOf(tagName);
  if (index === -1) {
    selectedTags.value.push(tagName);
  } else {
    selectedTags.value.splice(index, 1);
  }

  // 每次点击都重新筛选文章
  posts.value = [];
  page.value = 1;
  hasMore.value = true;
  loadPosts(true);
};

const handleLike = async (post) => {
  try {
    const res = await BlogApi.toggleLike(post.id);
    if (res.code === 0) {
      if (res.data.liked) {
        post.likeCount++;
        post.userLiked = true;
      } else {
        post.likeCount--;
        post.userLiked = false;
      }
    }
  } catch (err) {
    console.error('点赞失败:', err);
  }
};

const handleFavorite = async (post) => {
  try {
    const res = await BlogApi.toggleFavorite(post.id);
    if (res.code === 0) {
      if (res.data.favorited) {
        post.favoriteCount++;
        post.userFavorited = true;
      } else {
        post.favoriteCount--;
        post.userFavorited = false;
      }
    }
  } catch (err) {
    console.error('收藏失败:', err);
  }
};
const getMostCommentedPosts = async () => {
  try {
    const res = await BlogApi.getMostCommentedPosts();
    if (res.code === 0) {
      hotPosts.value = res.data;
    } else {
      console.warn('获取热门文章失败:', res.msg);
    }
  } catch (err) {
    console.error('请求出错:', err);
  }
}

// 跳转到文章详情页
const goToPostDetailFromHot = (postId) => {
  router.push(`/post/${postId}`);
};

// 页面加载时触发
onMounted(() => {
  getAllTags();
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
  getMostCommentedPosts();
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
  gap: 15px;
  margin: 0 10%;
  padding-top: 60px;
}

.left {
  flex: 1;
}

.center {
  flex: 3;
}

.right {
  flex: 1.5;
}

.post-card {
  padding: 20px;
  border-radius: 8px;
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
    .post-title {
      font-size: 22px;
      font-weight: bold;
      margin: 10px 0;
      white-space: normal;
      word-break: break-word;

      &:hover {
        color: #409EFF;
      }
    }

    .post-tag {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-width: 628px;
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
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
        user-select: none;

        &:hover {
          background-color: #f6f6f6;
        }
      }
    }
  }
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 40px;
}

.loading,
.no-more {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-top: 20px;
}

.right-container {
  padding: 10px 0 0 0;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;

  .info {
    padding: 0 20px;

    .title {
      font-size: 14.5px;
      color: #404040;
      margin-bottom: 9px;
    }

    .title:hover {
      color: #409EFF;
    }

    .count {
      color: #575757;
      font-size: 13px;
    }
  }

  :deep(.el-divider--horizontal) {
    margin: 16px 0;
    border-top: 1.4px #f6f6f6 solid;
  }
}

.tag-item1 {
  margin: 6px 0;

  :deep(.el-check-tag) {
    padding: 7px;
  }
}
</style>
