<template>
  <Header />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
</script>

<style>
:root .el-message {
  z-index: 10001 !important;
}

body {
  overflow-y: scroll;
}

/* 动画效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
} */
</style>
