import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import PostDetail from "@/views/PostDetail.vue";
import Create from "@/views/Create.vue";
import Profile from "@/views/Profile.vue";

//后续会优化为懒加载
const routes = [
    { path: "/", component: Home },     //首页
    { path: "/post/:id", component: PostDetail },   //文章详情页
    { path: "/create", component: Create },     //文章创建页
    { path: "/profile", component: Profile }       //个人页面
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  
  export default router;