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
    <el-select
        v-model="selectedTags"
        multiple
        :multiple-limit="5"
        filterable
        remote
        allow-create
        default-first-option
        :reserve-keyword="true"
        :remote-method="searchTags"
        :loading="loading"
        placeholder="请输入或选择标签（最多5个，非必选）"
        @change="handleTagChange"
        style="width: 100%; margin-bottom: 16px;"
        class="hash-tags"
    >
      <!-- 用自定义 tag 替换默认展示 -->
      <template #tag>
        <el-tag
            v-for="(tag, index) in selectedTags"
            :key="tag"
            :type="getTagType(tag)"
            closable
            @close="handleTagClose(index)"
            disable-transitions
        >
          #{{ tag }}
        </el-tag>
      </template>

      <!-- 下拉选项 -->
      <el-option
          v-for="item in tagOptions"
          :key="item.name"
          :label="item.name"
          :value="item.name"
      />
    </el-select>
    <MarkdownEditor v-if="content !== null" v-model="content"/>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import MarkdownEditor from "@/components/MarkdownEditor.vue";
import * as BlogApi from "@/api";
import {useTagColor} from '@/composables/useTagColor';

const title = ref("");
const content = ref(null);
const router = useRouter();
const route = useRoute();

const isEditMode = ref(false); // 是否是编辑模式
const postId = ref(null);

const selectedTags = ref([]);
const tagOptions = ref([]);
const loading = ref(false);
const {getTagType} = useTagColor();

const handleTagClose = (index) => {
  selectedTags.value.splice(index, 1);
};

// 标签远程搜索（防止加载全部标签）
const searchTags = async (keyword) => {
  if (!keyword.trim()) return;
  loading.value = true;
  try {
    const res = await BlogApi.searchTags(keyword);
    if (res.code === 0) {
      tagOptions.value = res.data;
    }
  } finally {
    loading.value = false;
  }
};

const handleTagChange = (newTags) => {
  const filtered = newTags.filter(tag => {
    if (tag.length > 50) {
      ElMessage.warning(`标签“${tag.slice(0, 10)}...”超过50字符限制`);
      return false;
    }
    return true;
  });

  if (filtered.length !== newTags.length) {
    selectedTags.value = filtered;
  }
};

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
        if (res.data.tags && Array.isArray(res.data.tags)) {
          selectedTags.value = res.data.tags;
          // 如果需要同时更新可选项列表以避免“输入已存在项”提示：
          tagOptions.value = [...new Set([...tagOptions.value.map(t => t.name), ...res.data.tags])].map(name => ({name}));
        }
      } else {
        ElMessage.error("加载文章失败！");
        await router.push("/profile");
      }
    } catch (error) {
      console.error("加载文章出错：", error);
      ElMessage.error("服务器出错！");
      await router.push("/profile");
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
  if (selectedTags.value.length > 5) {
    ElMessage.warning("最多只能选择 5 个标签！");
    return;
  }
  if (!content.value.trim()) {
    ElMessage.warning("文章内容不能为空！");
    return;
  }
  try {
    const payload = {
      title: title.value,
      tags: selectedTags.value,
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

:deep(.hash-tags .el-select__wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 10px;

  input {
    caret-color: black; /* 仍显示光标 */
  }
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
