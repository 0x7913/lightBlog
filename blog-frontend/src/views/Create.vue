<template>
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
</style>



<!-- <template>
  <div class="container">
  </div>
  <Editor @content-change="handleContentChange" />
  <div v-if="editorContent">
    <div v-html="editorContent"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Editor from '../components/Editor.vue'

const editorContent = ref(''); // 用于存储从子组件传递过来的内容

// 处理子组件传递过来的内容
const handleContentChange = (content) => {
  editorContent.value = content;
  console.log('接收到编辑器内容：', content);
};
</script>

<style lang="scss" scoped>
.container {
  margin: 0 20%;
  padding-top: 60px;
}
</style> -->