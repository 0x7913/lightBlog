<template>
  <div class="container4">
    <div class="profile-card" v-if="userInfo">
      <img :src="userInfo.avatar ? 'http://localhost:5000' + userInfo.avatar : Avatar" alt="用户头像"
           class="profile-avatar"/>
      <div class="profile-container">
        <div class="user-info">
          <div class="profile-name">
            <div>{{ userInfo.username }}</div>
          </div>
          <div class="profile-subinfo">
            <div class="flex-center">
              <Icon icon="mynaui:location" width="16px" height="16px" style="color: #999"/>
              <span class="location">{{ userInfo.location || "未填写地址" }}</span>
            </div>
            <div class="flex-center">
              <Icon icon="iconoir:birthday-cake" width="16px" height="16px" style="color: #999"/>
              <span>{{ userInfo.birthday || "未设置生日" }}</span>
            </div>
          </div>
          <div class="profile-bio">
            {{ userInfo.bio ? userInfo.bio : "暂无个人介绍" }}
          </div>
        </div>
        <div class="profile-edit">
          <Icon icon="basil:edit-outline" v-if="!route.params.id" @click="toEdit" class="edit-icon"/>
        </div>
      </div>
    </div>
    <div class="profile-info">
      <div class="menu-wrapper">
        <el-menu
            v-model="activeMenu"
            class="setting-menu"
            mode="vertical"
            @select="handleSelect"
            default-active="posts"
        >
          <el-menu-item index="posts">已发布文章</el-menu-item>
          <el-menu-item index="likes">点赞记录</el-menu-item>
          <el-menu-item index="favorites">收藏记录</el-menu-item>
          <el-menu-item index="comments">互动记录</el-menu-item>
        </el-menu>
      </div>

      <div class="postsList">
        <!-- 根据 activeMenu 进行条件渲染 -->
        <template v-if="['posts', 'likes', 'favorites'].includes(activeMenu)">
          <template v-if="postList.length">
            <div v-for="post in postList" @click="handlePostClick(post.id)" :key="post.id" class="post-card-wrapper">
              <div class="post-card">
                <div class="post-title">{{ post.title }}</div>
                <div v-if="activeMenu === 'posts'" class="post-time">发布于{{ formatDate(post.createdAt) }} | 更改于{{ formatDate(post.updatedAt) }}</div>
                <div v-else class="post-time">{{ formatDate(post.createdAt) }}</div>
              </div>
              <!-- 编辑和删除按钮 -->
              <div v-if="!route.params.id && activeMenu === 'posts'" class="post-actions">
                <div class="ed-icon">
                  <Icon icon="ant-design:edit-outlined" @click.stop="editPost(post.id)" class="icon"/>
                </div>
                <div class="ed-icon">
                  <Icon icon="ant-design:delete-outlined" @click.stop="deletePost(post.id)" class="icon" />
                </div>
              </div>
              <!-- 分割线：不是最后一项才显示 -->
              <el-divider/>
            </div>
          </template>
          <template v-else-if="!loading">
            <div  class="empty-tip">暂无文章</div>
          </template>
        </template>
        <template v-if="activeMenu === 'comments'">
          <template v-if="commentList.length">
            <div v-for="comment in commentList" @click="handleCommentClick(comment)" :key="comment.id" class="post-card-wrapper">
              <div class="post-card">
                <div class="comment-content">{{ comment.content }}</div>
                <div class="post-time">{{ formatDate(comment.createdAt) }}</div>
              </div>
              <el-divider/>
            </div>
          </template>
          <template v-else-if="!loading">
            <div class="empty-tip">暂无评论记录</div>
          </template>
        </template>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="!hasMore && (postList.length || commentList.length)" class="no-more">没有更多了</div>
        <div ref="observerTarget" class="observer-target"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, nextTick, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
import * as BlogApi from '@/api';
import Avatar from '@/assets/avatar/avatar.png'
import { ElMessageBox, ElMessage } from "element-plus";

const userInfo = ref(null)
const router = useRouter()
const route = useRoute();
const activeMenu = ref('posts');
const postList = ref([]);
const commentList = ref([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const DELAY = 300;
const observerTarget = ref(null); // 目标触发点
let observer = null;
let timeoutId = null;  // 延迟加载的计时器

const fetchUserInfo = async () => {
  try {
    const userId = route.params.id;
    const res = userId
        ? await BlogApi.getUserInfoById(userId)
        : await BlogApi.getUserInfo();
    userInfo.value = res.data;
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
};
const toEdit = () => {
  router.push('/setting')
}

const handleSelect = (key: string) => {
  activeMenu.value = key
  postList.value = []
  page.value = 1
  hasMore.value = true
  loadData()
};

// 通用加载方法，根据 activeMenu 请求不同接口
const loadData = async () => {
  if (!hasMore.value || loading.value) return;
  loading.value = true;
  try {
    const userId = route.params.id;
    let res: any;
    switch (activeMenu.value) {
      case "posts":
        res = userId
            ? await BlogApi.getUserPostList(userId, page.value)
            : await BlogApi.getMyPostList(page.value);
        postList.value.push(...res.data.posts);
        break;
      case "likes":
        res = userId
            ? await BlogApi.getUserLikedPostList(userId, page.value)
            : await BlogApi.getMyLikedPostList(page.value);
        postList.value.push(...res.data.posts);
        break;
      case "favorites":
        res = userId
            ? await BlogApi.getUserFavoritedPostList(userId, page.value)
            : await BlogApi.getMyFavoritedPostList(page.value);
        postList.value.push(...res.data.posts);
        break;
      case "comments":
        res = userId
            ? await BlogApi.getUserCommentList(userId, page.value)
            : await BlogApi.getMyCommentList(page.value);
        commentList.value.push(...res.data.comments);
        break;
      default:
        return;
    }
    if (res.code === 0) {
      hasMore.value = res.data.hasMore;
      page.value++;
    } else {
      ElMessage.error(res.msg || "加载失败");
    }
  } catch (err) {
    console.error("加载失败", err);
  } finally {
    loading.value = false; // 加载完成
    await nextTick(() => {
        initObserver();
    });
  }
};

const initObserver = () => {
  if (observer) observer.disconnect();
  if (!observerTarget.value) return;
  observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadData();
          }, DELAY);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
  );
  observer.observe(observerTarget.value);
};

const handlePostClick = (postId:string) => {
  if (!postId) return;
  router.push(`/post/${postId}`);
}

const handleCommentClick = (comment:any) => {
  if (!comment.postId || !comment.id) return;
  router.push(`/post/${comment.postId}#comment-${comment.id}`);
};

const editPost = (postId: string) => {
  router.push({ name: 'create', query: { id: postId } });
};

const deletePost = async (postId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const res = await BlogApi.deletePost(postId);
    if (res.code === 0) {
      ElMessage.success('文章删除成功');
      // 重新加载数据
      postList.value = [];
      page.value = 1;
      hasMore.value = true;
      await loadData();
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error) {
    console.error("删除文章失败", error);
  }
};

const formatDate = (date:any) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');  // 月份补0
  const day = String(d.getDate()).padStart(2, '0');         // 日期补0
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  fetchUserInfo()
  loadData()
})
onUnmounted(() => {
  if (observer) observer.disconnect();
  if (timeoutId) clearTimeout(timeoutId);
});
watch(() => route.params.id, () => {
  postList.value = [];
  page.value = 1;
  hasMore.value = true;
  fetchUserInfo();
  loadData();
});
</script>

<style lang="scss" scoped>
.container4 {
  margin: 0 20%;
  padding-top: 60px;
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 40px;
  margin-bottom: 20px;

  .profile-edit{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    transition: background 0.2s;
    cursor: pointer;
    .edit-icon {
      width: 23px;
      height: 23px;
      color: #999;
    }
    &:hover {
      background: #eaeaea;
    }
  }
  .profile-container{
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
  }

  .profile-name {
    font-size: 20px;
    color: #666;
  }

  .profile-subinfo {
    display: flex;
    align-items: center;
    gap: 30px;
    font-size: 13px;
    color: #999;
    margin-top: 4px;

    .flex-center {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
  }

  .profile-bio {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
}

.profile-info {
  display: flex;
  gap: 30px;

  .setting-menu {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1;
    width: 150px;
    height: 600px;
    border-radius: 8px;

    .overview {
      height: 56px;
    }
  }

  .postsList {
    flex: 6;
    background-color: #fff;
    padding: 4px  20px 20px 20px;
    border-radius: 8px;
    height: 100%;

    .post-card-wrapper {
      position: relative;
      .post-card {
        border-radius: 6px;
        transition: box-shadow 0.3s;
        padding: 16px 0;
        cursor: pointer;

        .post-title {
          color: #333;
          font-weight: 600;
        }
        .comment-content{
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
          white-space: pre-wrap;
          color: #333;
        }

        .post-time {
          font-size: 12px;
          margin-top: 10px;
          color: #666;
        }
      }
      .post-actions{
        display: flex;
        align-items: center;
        gap: 10px;
        position: absolute;
        right: -110px;
        top: 26px;
        .ed-icon{
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          transition: background 0.2s;
          cursor: pointer;
          .icon{
            width: 23px;
            height: 23px;
            color: #999;
          }
          &:hover {
            background: #eaeaea;
          }
        }
      }

      &:hover .post-title  {
        color: #409EFF;
      }
      &:hover .comment-content  {
        color: #409EFF;
      }

      :deep(.el-divider--horizontal) {
        margin: 0;
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
  }

  :deep(.el-menu) {
    background-color: #f6f6f6;
    border-right: none;

    .el-menu-item {
      margin-bottom: 5px;
      transition: background-color 0.3s;

      &:hover {
        border-radius: 8px;
        color: #409eff;
      }

      &.is-active {
        border-radius: 8px;
        background-color: #ffffff;
      }
    }
  }

  .menu-wrapper {
    position: sticky;
    top: 80px;
    align-self: flex-start;
    height: fit-content;
  }
}

</style>
