<template>
  <Header />
  <router-view></router-view>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
</script>

<style>
:root .el-message {
  z-index: 10001 !important;
}
</style>
