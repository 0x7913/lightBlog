import { reactive } from 'vue';

const predefinedTypes = ['success', 'info', 'warning', 'danger'];
const staticTagMap = {
    // 🌐 前端
    javascript: 'warning',
    typescript: 'warning',
    vue: 'success',
    react: 'info',
    html: 'danger',
    css: 'success',
    sass: 'success',
    less: 'success',
    webpack: 'info',
    vite: 'info',
    tailwind: 'success',
    elementplus: 'info',
    antd: 'info',

    // 🔧 后端
    node: 'info',
    express: 'info',
    nestjs: 'info',
    koa: 'info',
    springboot: 'info',
    django: 'success',
    flask: 'success',
    fastapi: 'success',
    go: 'warning',
    java: 'danger',
    python: 'success',
    php: 'danger',
    rust: 'info',

    // 🛢️ 数据库
    mysql: 'danger',
    mariadb: 'danger',
    postgresql: 'info',
    mongodb: 'success',
    redis: 'danger',
    sqlite: 'info',
    elasticsearch: 'warning',

    // 🖥️ 操作系统 / DevOps
    linux: 'info',
    ubuntu: 'info',
    centos: 'danger',
    windows: 'warning',
    docker: 'danger',
    kubernetes: 'warning',
    nginx: 'warning',
    git: 'info',
    github: 'info',
    gitlab: 'info',
    cicd: 'info',
    jenkins: 'warning',

    // 📦 包管理
    npm: 'info',
    yarn: 'info',
    pnpm: 'info',

    // 📈 工具/测试
    eslint: 'info',
    prettier: 'info',
    jest: 'warning',
    vitest: 'warning',
    cypress: 'warning',
    playwright: 'warning',
    swagger: 'info',
    postman: 'info',

    // 🧠 计算机基础
    数据结构: 'success',
    算法: 'warning',
    操作系统: 'info',
    计算机网络: 'info',
    网络安全: 'danger',
    http: 'info',
    https: 'success',

    // 🎯 编程实践
    面试: 'danger',
    项目实战: 'success',
    架构设计: 'info',
    经验总结: 'warning',
    踩坑记录: 'danger',
    代码优化: 'success',
    设计模式: 'info',
    性能调优: 'warning',
    安全加固: 'danger',

    // ✅ 学习/记录
    学习笔记: 'success',
    学习路线: 'warning',
    教程: 'success',
    技术分享: 'info',
    测试通过: 'success',
    毕业设计: 'info',
    论文相关: 'warning',

    // 💼 职业发展
    简历: 'warning',
    求职: 'danger',
    面试题: 'danger',
    技术面试: 'danger',
    薪资谈判: 'warning',

    // 🧩 其他
    开发工具: 'info',
    编辑器: 'info',
    vscode: 'info',
    intellij: 'info',
    chatgpt: 'success',
    ai: 'warning',
    plugin: 'info',
};

const dynamicTagMap = reactive({});

export function useTagColor() {
    const getTagType = (tag) => {
        const lowerTag = typeof tag === 'string' ? tag.toLowerCase() : tag;

        if (staticTagMap[lowerTag]) return staticTagMap[lowerTag];

        if (!dynamicTagMap[lowerTag]) {
            const index = Object.keys(dynamicTagMap).length % predefinedTypes.length;
            dynamicTagMap[lowerTag] = predefinedTypes[index];
        }

        return dynamicTagMap[lowerTag];
    };

    return {
        getTagType
    };
}
