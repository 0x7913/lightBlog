<template>
    <div class="top-header">
        <div class="header-container">
            <div class="logo" @click="toHome()">
                EchoLog
            </div>
        </div>
        <div style="flex:3;"></div>
        <div class="sign" v-if="!userInfo?.id && !userInfo?.username && !userInfo?.email">
            <el-button size="large" text @click="openLogin()">登 录</el-button>
            <el-button size="large" @click="openRegister()">创 建 账 号</el-button>
        </div>
        <!-- 用户信息展示区域 -->
        <div v-else class="signed">
            <div>
                <el-button size="large" type="primary" plain @click="goToCreate()">创建文章</el-button>
            </div>
            <el-dropdown class="user-avatar" trigger="click" placement="bottom-end" @command="handleCommand">
                <div>
                    <img :src="userInfo.avatar ? 'http://localhost:5000' + userInfo.avatar : Avatar" alt="用户头像"
                        class="avatar-img" />
                </div>
                <template #dropdown>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="profile">
                            <div class="userinfo">
                                <div class="username">{{ userInfo.username }}</div>
                                <div class="email">{{ userInfo.email }}</div>
                            </div>
                        </el-dropdown-item>
                        <div class="custom-divider"></div>
                        <el-dropdown-item command="create">发布文章</el-dropdown-item>
                        <el-dropdown-item command="settings">设置</el-dropdown-item>
                        <div class="custom-divider"></div>
                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>

    <!-- 登录弹窗 -->
    <el-dialog v-model="showLogin" :show-close="false" :modal="false" title="登录" width="450px">
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="loginForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showLogin = false">取消</el-button>
            <el-button type="primary" @click="handleLogin">登录</el-button>
        </template>
    </el-dialog>

    <!-- 注册弹窗 -->
    <el-dialog v-model="showRegister" :show-close="false" :modal="false" title="注册" width="450px">
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="80px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
                <div style="display: flex; flex: 1; gap: 10px;">
                    <el-input v-model="registerForm.code" placeholder="输入验证码" />
                    <el-button type="primary" :disabled="codeTimer > 0" @click="sendVerificationCode">
                        {{ codeTimer > 0 ? `${codeTimer}s` : "发送验证码" }}
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showRegister = false">取消</el-button>
            <el-button type="primary" @click="handleRegister">注册</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import * as BlogApi from '@/api';
import Avatar from '@/assets/avatar/avatar.png'
import { useRouter } from "vue-router";
import { eventBus } from '@/utils/eventBus';

const router = useRouter()
const showLogin = ref(false);
const showRegister = ref(false);
const codeTimer = ref(0);
const userInfo = ref(null)
let timer: NodeJS.Timeout | null = null;

// 表单引用，用于校验
const loginFormRef = ref(null);
const registerFormRef = ref(null);

// 表单校验规则
const loginRules = {
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur"] },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
    ],
};

const registerRules = {
    username: [
        { required: true, message: "用户名不能为空", trigger: "blur" },
        { min: 3, max: 20, message: "用户名长度在 3 到 20 个字符", trigger: "blur" }
    ],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur"] },
    ],
    code: [
        { required: true, message: "请输入验证码", trigger: "blur" },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码至少6个字符", trigger: "blur" },
    ],
};

// 登录表单
const loginForm = ref({
    email: "",
    password: "",
});

// 注册表单
const registerForm = ref({
    email: "",
    code: "",
    username: "",
    password: "",
});

// 打开登录弹窗
const openLogin = () => {
    showLogin.value = true;
    showRegister.value = false;
};

// 打开注册弹窗
const openRegister = () => {
    showRegister.value = true;
    showLogin.value = false;
};

// 发送验证码
const sendVerificationCode = async () => {
    // 单独验证邮箱字段
    registerFormRef.value.validateField('email', async (errorMessage) => {
        if (!errorMessage) return
        try {
            await BlogApi.sendCode(registerForm.value.email);
            ElMessage.success("验证码已发送，请查收邮箱");
            // 启动倒计时
            codeTimer.value = 60;
            timer = setInterval(() => {
                if (codeTimer.value > 0) {
                    codeTimer.value--;
                } else {
                    clearInterval(timer);
                }
            }, 1000);
        } catch (error) {
            ElMessage.error("验证码发送失败");
        }
    });
};

// 处理登录，先验证表单数据
const handleLogin = () => {
    loginFormRef.value.validate(async (valid) => {
        if (!valid) return;
        try {
            const res = await BlogApi.login(loginForm.value);
            localStorage.setItem("token", res.data.token);
            ElMessage.success("登录成功");
            await fetchUserInfo();
            eventBus.emit('refresh-posts');
            showLogin.value = false;
        } catch (error) {
            ElMessage.error("登录失败，请检查邮箱和密码");
        }
    });
};
// 处理注册，先验证表单数据
const handleRegister = () => {
    registerFormRef.value.validate(async (valid) => {
        if (!valid) return;
        try {
            await BlogApi.register(registerForm.value);
            ElMessage.success("注册成功，请登录");
            showRegister.value = false;
            showLogin.value = true;
        } catch (error) {
            ElMessage.error("注册失败");
        }
    });
};
const fetchUserInfo = async () => {
    try {
        const res = await BlogApi.getUserInfo();
        userInfo.value = res.data
        localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
    } catch (error) {
        console.error("获取用户信息失败", error);
    }
};

const handleCommand = (command) => {
    switch (command) {
        case "logout":
            logout();
            break;
        case "settings":
            router.push("/setting");
            break;
        case "profile":
            router.push("/profile");
            break;
        case "create":
            router.push("/create");
            break;
        default:
            console.warn("未知命令:", command);
    }
}

const goToCreate = () => {
    router.push("/create");
}
const toHome = () => {
    eventBus.emit('refresh-posts');
    router.push("/");
}
const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    userInfo.value = null;
    eventBus.emit('refresh-posts');
    ElMessage.success("退出成功");
    router.push("/");
}

const updateUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo;
};
// 页面加载时检查是否有用户信息
onMounted(() => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
        userInfo.value = JSON.parse(savedUserInfo);
    }
    eventBus.on("userInfoUpdated", updateUserInfo);
});
onUnmounted(() => {
    eventBus.off("userInfoUpdated", updateUserInfo);
});
</script>

<style lang="scss" scoped>
.top-header {
    display: flex;
    background-color: #ffffff;
    width: 100%;
    height: 56px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    border-bottom: 1px solid #d1d9e0;

    .header-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .logo {
            background: #000;
            border-radius: 4px;
            padding: 4px;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            cursor: pointer;
        }
    }

    .sign {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .signed {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;

        .user-avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 4px;

            .avatar-img {
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;

                &:hover {
                    border: 3px solid #ebecfc;
                }
            }
        }
    }
}

.userinfo {
    .username {
        font-weight: 600;
        font-size: 16px;
    }
}

.custom-divider {
    height: 1px;
    background-color: #e4e7ed;
    margin: 10px 10px;
}

.el-dropdown-menu {
    padding: 10px 0;
}

:deep(.el-dropdown-menu__item) {
    border-radius: 4px;
    margin: 0 10px;
}

:deep(.el-dropdown-menu__item:first-child) {
    height: 40px;
}
</style>
