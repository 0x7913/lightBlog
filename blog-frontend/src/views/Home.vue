<template>
  <div class="top-header">
    <div class="header-container"></div>
    <div class="sign" v-if="!userInfo">
      <el-button size="large" text @click="openLogin">登 录</el-button>
      <el-button size="large" color="#626aef" plain @click="openRegister">注 册</el-button>
    </div>
    <!-- 用户信息展示区域 -->
    <div class="user-info" v-else>
      <span>{{ userInfo.username }}</span>
    </div>
  </div>

  <div class="container">首页</div>

  <!-- 登录弹窗 -->
  <el-dialog v-model="showLogin" title="登录" width="400px">
    <el-form :model="loginForm" label-width="80px">
      <el-form-item label="邮箱">
        <el-input v-model="loginForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showLogin = false">取消</el-button>
      <el-button type="primary" @click="handleLogin">登录</el-button>
    </template>
  </el-dialog>

  <!-- 注册弹窗 -->
  <el-dialog v-model="showRegister" title="注册" width="400px">
    <el-form :model="registerForm" label-width="80px">
      <el-form-item label="邮箱">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="验证码">
        <div style="display: flex; gap: 10px;">
          <el-input v-model="registerForm.code" placeholder="输入验证码" />
          <el-button type="primary" :disabled="codeTimer > 0" @click="sendVerificationCode">
            {{ codeTimer > 0 ? `${codeTimer}s` : "发送验证码" }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="registerForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showRegister = false">取消</el-button>
      <el-button type="primary" @click="handleRegister">注册</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import * as BlogApi from '@/api';

const showLogin = ref(false);
const showRegister = ref(false);
const codeTimer = ref(0);
const userInfo = ref(null)
let timer: NodeJS.Timeout | null = null;

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
  confirmPassword: "",
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
  if (!registerForm.value.email) {
    return ElMessage.error("请输入邮箱");
  }
  try {
    await BlogApi.sendCode(registerForm.value.email);
    ElMessage.success("验证码已发送，请查收邮箱");

    // 启动倒计时
    codeTimer.value = 60;
    timer = setInterval(() => {
      if (codeTimer.value > 0) {
        codeTimer.value--;
      } else {
        clearInterval(timer as NodeJS.Timeout);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error("验证码发送失败");
  }
};

// 处理登录
const handleLogin = async () => {
  try {
    const res = await BlogApi.login(loginForm.value);
    localStorage.setItem("token", res.token);
    ElMessage.success("登录成功");
    fetchUserInfo()
    showLogin.value = false;
  } catch (error) {
    ElMessage.error("登录失败，请检查邮箱和密码");
  }
};

// 处理注册
const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    return ElMessage.error("两次输入的密码不一致");
  }
  try {
    await BlogApi.register(registerForm.value);
    ElMessage.success("注册成功，请登录");
    showRegister.value = false;
    showLogin.value = true;
  } catch (error) {
    ElMessage.error("注册失败");
  }
};
const fetchUserInfo = async () => {
  try {
    const res = await BlogApi.getUserInfo();
    userInfo.value = res
    localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
    console.log(userInfo.value);
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
};
// 页面加载时检查是否有用户信息
onMounted(() => {
  const savedUserInfo = localStorage.getItem("userInfo");
  if (savedUserInfo) {
    userInfo.value = JSON.parse(savedUserInfo);
  }
});
</script>

<style lang="scss" scoped>
.top-header {
  display: flex;
  background-color: #ffffff;
  width: 100%;
  height: 56px;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;

  .header-container {
    flex: 3;
  }

  .sign {
    flex: 1;
    width: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.container {
  width: 100vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
