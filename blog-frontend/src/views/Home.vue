<template>
  <div class="container" @click="tocreate()">首页</div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter(); // 获取 router 实例

const tocreate = () => {
  router.push("/create"); // 跳转到发布文章页面
};
</script>

<style scoped></style>
