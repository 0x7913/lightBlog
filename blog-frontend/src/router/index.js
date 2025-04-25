import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import PostDetail from "@/views/PostDetail.vue";
import Create from "@/views/Create.vue";
import Profile from "@/views/Profile.vue";
import Setting from "../views/Setting.vue";

//TODO:后续优化为懒加载
const routes = [
    { path: "/", component: Home ,name: 'home', meta: { noAuth: true } },     //首页(未登录不做拦截)
    { path: "/post/:id", component: PostDetail ,name: 'post', meta: { noAuth: true }},   //文章详情页(未登录不做拦截)
    { path: "/create", component: Create, name: 'create' },     //文章创建页
    { path: "/profile", component: Profile, name: 'my-profile'},       //自己的个人页面
    { path: "/profile/:id", component: Profile, name: 'user-profile', meta: { noAuth: true } },       //他人的个人页面
    { path: "/setting", component: Setting, name: 'setting' },       //设置页面
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

// 可以在前端判断是否有token，需要调用接口的地方在后端对token进行验证

// 添加路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem("token"); // 判断是否已登录

    if (!isAuthenticated && !to.matched.some(record => record.meta.noAuth)) {
        next("/"); // 未登录
    } else {
        next(); // 允许访问
    }
});

  export default router;
