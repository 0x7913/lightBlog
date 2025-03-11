// import { defineStore } from "pinia";
// import * as BlogApi from '@/api';

// export const useUserStore = defineStore("user", {
//   state: () => ({
//     userInfo: null, // 让 Pinia 维护，不手动读写 localStorage
//   }),
//   actions: {
//     setUserInfo(userInfo) {
//       this.userInfo = userInfo;
//     },
//     clearUserInfo() {
//       this.userInfo = null;
//     },
//     async fetchUserInfo() {
//       try {
//         const res = await BlogApi.getUserInfo();
//         this.setUserInfo(res);
//       } catch (error) {
//         console.error("获取用户信息失败", error);
//       }
//     }
//   },
//   persist: {
//     enabled: true, // 开启持久化
//     strategies: [
//       {
//         key: "userInfo",
//         storage: localStorage, // 默认 localStorage，也可以用 sessionStorage
//       },
//     ],
//   },
// });