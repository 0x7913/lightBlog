import { createRouter, createWebHistory } from "vue-router";

// 懒加载组件
const Home = () => import("@/views/Home.vue");
const PostDetail = () => import("@/views/PostDetail.vue");
const Create = () => import("@/views/Create.vue");
const Profile = () => import("@/views/Profile.vue");
const Setting = () => import("@/views/Setting.vue");

const routes = [
    { path: "/", component: Home, name: "home", meta: { noAuth: true } },             // 首页
    { path: "/post/:id", component: PostDetail, name: "post", meta: { noAuth: true } }, // 文章详情页
    { path: "/create", component: Create, name: "create" },                           // 创建文章
    { path: "/profile", component: Profile, name: "my-profile" },                     // 个人页面（自己）
    { path: "/profile/:id", component: Profile, name: "user-profile", meta: { noAuth: true } }, // 他人页面
    { path: "/setting", component: Setting, name: "setting" },                        // 设置页面
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem("token"); // 判断是否已登录
    if (!isAuthenticated && !to.matched.some(record => record.meta.noAuth)) {
        next("/"); // 未登录
    } else {
        next(); // 允许访问
    }
});

export default router;
