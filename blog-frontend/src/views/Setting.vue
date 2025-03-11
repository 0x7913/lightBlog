<template>
    <div class="container">
        <el-menu v-model="activeMenu" class="setting-menu" mode="vertical" @select="handleSelect">
            <el-menu-item class="overview" index="overview">用户</el-menu-item>
            <el-menu-item class="account" index="account">账号</el-menu-item>
        </el-menu>
        <!-- 根据 activeMenu 进行条件渲染 -->
        <div class="content">
            <template v-if="activeMenu === 'overview'">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>{{ userInfo?.email }}</span>
                        </div>
                    </template>
                    <el-form :model="formData" label-width="80px">
                        <el-form-item label="用户名">
                            <el-input v-model="formData.username" placeholder="请输入用户名" />
                        </el-form-item>
                        <el-form-item label="电子邮箱">
                            <el-input v-model="formData.email" disabled />
                        </el-form-item>
                        <el-form-item label="头像">
                            <div class="avatar-preview">
                                <img v-if="avatarUrl" :src="avatarUrl" class="avatar" width="50" height="50" />
                                <!-- <Icon v-else icon="line-md:file-upload" width="48" height="48" /> -->
                            </div>
                            <input type="file" @change="handleFileChange" accept="image/*" />
                        </el-form-item>
                    </el-form>
                    <template #footer><el-button type="primary" @click="submitForm">保存修改</el-button></template>
                </el-card>
            </template>
            <template v-else-if="activeMenu === 'account'">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>{{ userInfo?.email }}</span>
                        </div>
                    </template>

                    <template #footer>Footer content</template>
                </el-card>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import * as BlogApi from '@/api';

const userInfo = ref(null)

// 表单数据
const formData = ref({
    username: '',
    email: '',
    avatar: null as string | null, // 存头像 URL
    avatarFile: null as File | null, // 存 File
});

const avatarUrl = ref(''); // 头像预览
const activeMenu = ref('overview');

const handleSelect = (key, keyPath) => {
    activeMenu.value = key
};

// 处理文件选择
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    formData.value.avatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        avatarUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
};

const submitForm = async () => {
    const submitData = new FormData();
    submitData.append('username', formData.value.username);
    if (formData.value.avatarFile) {
        submitData.append('avatar', formData.value.avatarFile);
    }

    try {
        const res = await BlogApi.updateUserInfo(submitData);
        console.log(res);

        if (res) {
            ElMessage.success('修改成功');

            userInfo.value = {
                ...userInfo.value,
                username: res.user.username,
                avatar: res.user.avatar, // 确保返回的是相对路径
            };
            localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
        }
    } catch (err) {
        console.error('修改失败:', err);
        ElMessage.error('修改失败，请重试');
    }
};

const LOCAL_BASE_URL = 'http://localhost:5000';

onMounted(() => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
        userInfo.value = JSON.parse(savedUserInfo);
    }

    if (userInfo.value) {
        formData.value.username = userInfo.value.username;
        formData.value.email = userInfo.value.email;
        avatarUrl.value = userInfo.value.avatar ? `${LOCAL_BASE_URL}${userInfo.value.avatar}` : '';
    }
});
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin: 0 20%;
    padding-top: 60px;
}

.setting-menu {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1;
    width: 200px;
    height: 600px;
    border-radius: 4px;

    .overview {
        height: 50px;
    }
}

.content {
    flex: 4;

    .card-header {
        font-weight: 700;
        font-size: 24px;
    }

    :deep(.el-card.is-always-shadow, .el-card.is-hover-shadow:focus, .el-card.is-hover-shadow:hover) {
        box-shadow: none;
        height: 600px;
    }
}
</style>
