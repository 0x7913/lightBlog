import { defineStore } from 'pinia';

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [],          // 缓存文章
    page: 1,            // 当前页码
    hasMore: true,       // 是否有更多文章
    scrollTop: 0         // 滚动位置
  }),
  actions: {
    setPosts(newPosts) {
      this.posts = newPosts;
    },
    appendPosts(newPosts) {
      this.posts.push(...newPosts);
    },
    setPage(newPage) {
      this.page = newPage;
    },
    setHasMore(value) {
      this.hasMore = value;
    },
    setScrollTop(value) {
      this.scrollTop = value;
    }
  }
});