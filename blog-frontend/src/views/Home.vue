<template>
  <div class="container">
    <div v-for="post in posts" :key="post.id" class="post-card">
      <h2>{{ post.title }}</h2>
      <p>作者：{{ post.author }}</p>
      <p>评论数：{{ post.commentCount }}</p>
      <p>发布时间：{{ formatDate(post.createdAt) }}</p>
    </div>

    <div v-if="hasMore" class="load-more" @click="loadMore">加载更多</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as BlogApi from '@/api';

const posts = ref([]);
const page = ref(1);
const hasMore = ref(true);

const loadPosts = async () => {
  try {
    const res = await BlogApi.getPostList(page.value, 10);
    if (res.code === 0) {
      posts.value.push(...res.data.posts);
      hasMore.value = res.data.hasMore;
      page.value++;
    }
  } catch (error) {
    console.error("加载文章失败:", error);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  loadPosts();
});

const loadMore = () => {
  loadPosts();
};
</script>

<style lang="scss" scoped>
.container {
  margin: 0 20%;
  padding-top: 60px;
}

.post-card {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
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
