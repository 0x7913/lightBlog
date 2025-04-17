<template>
  <div class="container4">
    <div class="profile-card" v-if="userInfo">
      <img :src="userInfo.avatar ? 'http://localhost:5000' + userInfo.avatar : Avatar" alt="用户头像" class="profile-avatar" />
        <Icon icon="basil:edit-outline" @click="toEdit" class="edit-icon"/>
      <div class="user-info">
        <div class="profile-name">
          <div>{{ userInfo.username }}</div>
        </div>
        <div class="profile-subinfo">
          <div class="flex-center">
            <Icon icon="mynaui:location" width="16px" height="16px"  style="color: #999" />
            <span class="location">{{ userInfo.location || "未填写地址" }}</span>
          </div>
          <div class="flex-center">
            <Icon icon="iconoir:birthday-cake" width="16px" height="16px"  style="color: #999" />
            <span>{{ userInfo.birthday || "未设置生日" }}</span>
          </div>
        </div>
        <div class="profile-bio">
          {{ userInfo.bio ? userInfo.bio : "暂无个人介绍" }}
        </div>
      </div>
    </div>
    <div class="profile-info">
      <el-menu
          v-model="activeMenu"
          class="setting-menu"
          mode="vertical"
          @select="handleSelect"
          default-active="posts"
      >
        <el-menu-item index="posts">已发布文章</el-menu-item>
        <el-menu-item index="likes">我的点赞</el-menu-item>
        <el-menu-item index="favorites">我的收藏</el-menu-item>
        <el-menu-item index="comments">互动记录</el-menu-item>
      </el-menu>
    </div>
    <!-- 根据 activeMenu 进行条件渲染 -->

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import * as BlogApi from '@/api';
import Avatar from '@/assets/avatar/avatar.png'
import { ElMessage } from "element-plus";

const userInfo = ref(null)
const router = useRouter()
const activeMenu = ref('overview');
const postList = ref([]);
const page = ref(1);
const hasMore = ref(true);

const fetchUserInfo = async () => {
  try {
    const res = await BlogApi.getUserInfo();
    userInfo.value = res.data
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
};

const toEdit = () => {
  router.push('/setting')
}

const handleSelect = (key:string) => {
  activeMenu.value = key
  postList.value = []
  page.value = 1
  hasMore.value = true
  loadData()
};

// 通用加载方法，根据 activeMenu 请求不同接口
const loadData = async () => {
  if (!hasMore.value) return;

  let res;
  try {
    switch (activeMenu.value) {
      case "posts":
        res = await BlogApi.getMyPostList(page.value);
        break;
      // case "likes":
      //   res = await BlogApi.getLikedPosts(page.value);
      //   break;
      // case "favorites":
      //   res = await BlogApi.getFavoritedPosts(page.value);
      //   break;
      // case "comments":
      //   res = await BlogApi.getMyComments(page.value);
      //   break;
      default:
        return;
    }

    if (res.code === 0) {
      postList.value.push(...res.data.posts);
      console.log("post",postList.value)
      hasMore.value = res.data.hasMore;
      page.value++;
    } else {
      ElMessage.error(res.msg || "加载失败");
    }
  } catch (err) {
    console.error("加载失败", err);
  }
};

onMounted(()=>{
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.container4 {
  margin: 0 20%;
  padding-top: 60px;
}
.profile-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 30px;
  .edit-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 23px;
    height: 23px;
    color: #999;
    cursor: pointer;
  }
  .user-info{
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
    .flex-center{
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
.profile-info{
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
  :deep(.el-menu){
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
}

</style>
