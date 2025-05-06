<template>
  <div class="container3">
    <el-input
        style="width: 100%"
        v-model="title"
        placeholder="请输入文章标题...(5~100)"
        class="title-input"
        :input-style="{ fontSize: '22px', fontWeight: 'bold', color: '#333' }"
    >
      <template #append>
        <div @click="handleSubmit" style="font-size: 14px; font-weight: 500; cursor: pointer;">
          {{ isEditMode ? '提交修改' : '发布文章' }}
        </div>
      </template>
    </el-input>
    <MarkdownEditor v-if="content !== null" v-model="content" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import MarkdownEditor from "@/components/MarkdownEditor.vue";
import * as BlogApi from "@/api";

const title = ref("");
const content = ref(null);
const router = useRouter();
const route = useRoute();

const isEditMode = ref(false); // 是否是编辑模式
const postId = ref(null);

onMounted(async () => {
  postId.value = route.query.id;
  content.value = ""; // 确保 MarkdownEditor 正确挂载

  if (postId.value) {
    isEditMode.value = true;
    try {
      const res = await BlogApi.getPostDetail(postId.value);
      if (res.code === 0) {
        title.value = res.data.title;
        content.value = res.data.content;
      } else {
        ElMessage.error("加载文章失败！");
        router.push("/profile");
      }
    } catch (error) {
      console.error("加载文章出错：", error);
      ElMessage.error("服务器出错！");
      router.push("/profile");
    }
  }
});

const handleSubmit = async () => {
  if (!title.value.trim()) {
    ElMessage.warning("文章标题不能为空！");
    return;
  }
  if (title.value.trim().length < 5 || title.value.trim().length > 100) {
    ElMessage.warning("标题字数应为 5~100 之间");
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

    let res;
    if (isEditMode.value) {
      res = await BlogApi.updatePost(postId.value, payload);
    } else {
      res = await BlogApi.createPost(payload);
    }

    if (res.code === 0) {
      ElMessage.success(isEditMode.value ? "修改成功！" : "发布成功！");
      await router.push(`/post/${isEditMode.value ? postId.value : res.data.id}`);
    } else {
      ElMessage.error(isEditMode.value ? "修改失败，请重试！" : "发布失败，请重试！");
    }
  } catch (error) {
    console.error(isEditMode.value ? "修改出错：" : "发布出错：", error);
    ElMessage.error("服务器出错，请稍后再试！");
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
