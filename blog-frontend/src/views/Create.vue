<template>
  <div class="container3">
    <el-input style="width: 100%" v-model="title" placeholder="请输入文章标题..." class="title-input"
      :input-style="{ fontSize: '22px', fontWeight: 'bold', color: '#333' }">
      <template #append>
        <div @click="publishArticle" style="font-size: 14px; font-weight: 500;cursor: pointer;">发布文章</div>
      </template>
    </el-input>
    <MarkdownEditor v-if="content !== null" v-model="content" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import MarkdownEditor from "@/components/MarkdownEditor.vue";
import * as BlogApi from '@/api';

const title = ref("");
const content = ref(null);
const router = useRouter();

onMounted(() => {
  content.value = ""; // 确保 `content` 赋值后，MarkdownEditor 才会挂载
});

const publishArticle = async () => {
  if (!title.value.trim()) {
    ElMessage.warning("文章标题不能为空！");
    return;
  }
  if (!content.value.trim()) {
    ElMessage.warning("文章内容不能为空！");
    return;
  }
  try {
    const payload = {
      title: title.value,
      content: content.value
    };

    const res = await BlogApi.createPost(payload);

    if (res.code === 0) {
      ElMessage.success("文章发布成功！");
      // 跳转到文章详情页
      router.push(`/post/${res.data.id}`);
    } else {
      ElMessage.error("文章发布失败，请重试！");
    }
  } catch (error) {
    console.error("发布失败：", error);
    ElMessage.error("发布出错，请稍后重试！");
  }
};
</script>
<style lang="scss" scoped>
.container3 {
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