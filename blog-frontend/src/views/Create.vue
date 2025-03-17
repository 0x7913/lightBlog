<template>
  <div class="container">
    <el-input style="width: 100%" v-model="title" placeholder="请输入文章标题..." class="title-input"
      :input-style="{ fontSize: '22px', fontWeight: 'bold', color: '#333' }" />
    <MarkdownEditor v-if="content !== null" v-model="content" />
    <button @click="publishArticle">发布</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MarkdownEditor from "@/components/MarkdownEditor.vue";

const title = ref("");
const content = ref(null);

onMounted(() => {
  content.value = ""; // 确保 `content` 赋值后，MarkdownEditor 才会挂载
});

const publishArticle = () => {
  console.log("发布文章：", {
    title: title.value,
    content: content.value,
  });
};
</script>
<style lang="scss" scoped>
.container {
  margin: 0 20%;
  padding-top: 60px;
}

.title-input {
  height: 48px;
  margin-bottom: 10px;
  font-size: 22px !important;
  font-weight: bold !important;
  color: #333 !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
}
</style>


<!-- TipTap -->
<!-- <template>
  <div class="container">
    <Tiptap />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Tiptap from '../components/Tiptap.vue'
</script>

<style lang="scss" scoped>
.container {
  margin: 0 20%;
  padding-top: 60px;
}
</style> -->