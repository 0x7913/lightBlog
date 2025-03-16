<template>
  <div class="container">
    <h2>发布文章</h2>
    <input type="text" v-model="title" placeholder="文章标题" class="title-input" />
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
<style lang="scss">
.container {
  margin: 0 20%;
  padding-top: 60px;
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