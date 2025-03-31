<template>
    <div class="container5">
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

                    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="formData.username" placeholder="请输入用户名" />
                        </el-form-item>
                        <el-form-item label="电子邮箱">
                            <el-input v-model="formData.email" disabled />
                        </el-form-item>
                        <el-form-item label="头像">
                            <el-upload class="avatar-uploader" :show-file-list="false" :http-request="uploadAvatar"
                                accept="image/*">
                                <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
                                <img v-else :src="Avatar" class="avatar" />
                            </el-upload>
                        </el-form-item>
                    </el-form>

                    <template #footer>
                        <el-button type="primary" @click="submitForm">
                            保存修改
                        </el-button>
                    </template>
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
import { ref, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as BlogApi from '@/api';
import { eventBus } from '@/utils/eventBus';
import Avatar from '@/assets/avatar/avatar.png'

const userInfo = ref(null);
const avatarUrl = ref('');
const activeMenu = ref('overview');
const LOCAL_BASE_URL = 'http://localhost:5000';

const formRef = ref(null);
const formData = ref({
    username: '',
    email: '',
    avatar: '',
    relativeAvatarUrl: ''// 头像相对路径
});

const rules = {
    username: [
        { required: true, message: "用户名不能为空", trigger: "blur" },
        { min: 3, max: 20, message: "用户名长度在 3 到 20 个字符", trigger: "blur" }
    ]
};

const handleSelect = (key, keyPath) => {
    activeMenu.value = key
};

// 头像上传方法
const uploadAvatar = async (fileData: { file: File }) => {
    try {
        const uploadFormData = new FormData();
        uploadFormData.append("avatar", fileData.file);

        const res = await BlogApi.uploadAvatar(uploadFormData);

        if (res && res.code === 0) {
            avatarUrl.value = `${LOCAL_BASE_URL}${res.data.avatar}`;
            formData.value.relativeAvatarUrl = res.data.avatar;
            ElMessage.success("头像上传成功！");
        } else {
            ElMessage.error("头像上传失败，请重试！");
        }
    } catch (error) {
        console.error("接口请求异常:", error);
        ElMessage.error("头像上传失败，请重试！");
    }
};
// 提交修改
const submitForm = async () => {
    formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await BlogApi.updateUserInfo({
                    username: formData.value.username,
                    avatar: formData.value.relativeAvatarUrl // 提交最新的头像路径
                });
                if (res?.code === 0) {
                    fetchUserInfo()
                    ElMessage.success("用户信息更新成功！");
                }
            } catch (error) {
                ElMessage.error("更新失败，请重试！");
            }
        }
    })
};


const fetchUserInfo = async () => {
    try {
        const res = await BlogApi.getUserInfo();
        userInfo.value = res.data
        localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
        // 触发事件，通知其他组件更新
        eventBus.emit("userInfoUpdated", userInfo.value);
    } catch (error) {
        console.error("获取用户信息失败", error);
    }
};

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
.container5 {
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

    .avatar {
        width: 46px;
        height: 46px;
    }

    :deep(.el-card.is-always-shadow, .el-card.is-hover-shadow:focus, .el-card.is-hover-shadow:hover) {
        box-shadow: none;
        height: 600px;
    }
}
</style>
