<template>
  <view class="register-container">
    <view class="header">
      <view class="app-logo">📖</view>
      <view class="app-title">记意 Parli</view>
      <view class="app-subtitle">创建您的学习账户</view>
    </view>
    
    <view class="register-form">
      <view class="form-title">用户注册</view>
      
      <view class="input-group">
        <view class="input-label">
          <text class="input-icon">👤</text>
          <text>用户名</text>
        </view>
        <input 
          v-model="formData.username"
          class="form-input"
          :class="{ 'error': errors.username }"
          placeholder="请输入用户名（至少3个字符）"
          :disabled="loading"
          maxlength="20"
          @blur="validateUsername"
        />
        <text v-if="errors.username" class="error-text">{{ errors.username }}</text>
      </view>
      
      <view class="input-group">
        <view class="input-label">
          <text class="input-icon">😊</text>
          <text>昵称</text>
        </view>
        <input 
          v-model="formData.nickname"
          class="form-input"
          :class="{ 'error': errors.nickname }"
          placeholder="请输入昵称（至少2个字符）"
          :disabled="loading"
          maxlength="20"
          @blur="validateNickname"
        />
        <text v-if="errors.nickname" class="error-text">{{ errors.nickname }}</text>
      </view>
      
      <view class="input-group">
        <view class="input-label">
          <text class="input-icon">🔒</text>
          <text>密码</text>
        </view>
        <input 
          v-model="formData.password"
          class="form-input"
          :class="{ 'error': errors.password }"
          placeholder="请输入密码（至少6个字符）"
          password
          :disabled="loading"
          maxlength="50"
          @blur="validatePassword"
        />
        <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
      </view>
      
      <view class="input-group">
        <view class="input-label">
          <text class="input-icon">🔓</text>
          <text>确认密码</text>
        </view>
        <input 
          v-model="formData.confirmPassword"
          class="form-input"
          :class="{ 'error': errors.confirmPassword }"
          placeholder="请再次输入密码"
          password
          :disabled="loading"
          maxlength="50"
          @blur="validateConfirmPassword"
        />
        <text v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</text>
      </view>
      
      <view class="form-actions">
        <button 
          class="register-btn"
          :class="{ 'loading': loading }"
          :disabled="loading || !isFormValid"
          @click="handleRegister"
        >
          <text v-if="loading">注册中...</text>
          <text v-else>注册</text>
        </button>
        
        <view class="form-links">
          <text class="link-text" @click="goToLogin">已有账号？立即登录</text>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">注册即表示您同意我们的服务条款</text>
    </view>
  </view>
</template>

<script>
import { register } from '@/utils/userManager.js'

export default {
  data() {
    return {
      formData: {
        username: '',
        nickname: '',
        password: '',
        confirmPassword: ''
      },
      errors: {
        username: '',
        nickname: '',
        password: '',
        confirmPassword: ''
      },
      loading: false
    }
  },
  
  computed: {
    isFormValid() {
      return this.formData.username.length >= 3 && 
             this.formData.nickname.length >= 2 &&
             this.formData.password.length >= 6 &&
             this.formData.confirmPassword === this.formData.password &&
             !this.hasErrors
    },
    
    hasErrors() {
      return Object.values(this.errors).some(error => error !== '')
    }
  },
  
  methods: {
    validateUsername() {
      if (!this.formData.username) {
        this.errors.username = '用户名不能为空'
      } else if (this.formData.username.length < 3) {
        this.errors.username = '用户名至少3个字符'
      } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(this.formData.username)) {
        this.errors.username = '用户名只能包含字母、数字、下划线和中文'
      } else {
        this.errors.username = ''
      }
    },
    
    validateNickname() {
      if (!this.formData.nickname) {
        this.errors.nickname = '昵称不能为空'
      } else if (this.formData.nickname.length < 2) {
        this.errors.nickname = '昵称至少2个字符'
      } else {
        this.errors.nickname = ''
      }
    },
    
    validatePassword() {
      if (!this.formData.password) {
        this.errors.password = '密码不能为空'
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码至少6个字符'
      } else {
        this.errors.password = ''
        // 如果确认密码已填写，重新验证
        if (this.formData.confirmPassword) {
          this.validateConfirmPassword()
        }
      }
    },
    
    validateConfirmPassword() {
      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = '请确认密码'
      } else if (this.formData.confirmPassword !== this.formData.password) {
        this.errors.confirmPassword = '两次输入的密码不一致'
      } else {
        this.errors.confirmPassword = ''
      }
    },
    
    validateAllFields() {
      this.validateUsername()
      this.validateNickname()
      this.validatePassword()
      this.validateConfirmPassword()
    },
    
    async handleRegister() {
      this.validateAllFields()
      
      if (!this.isFormValid) {
        uni.showToast({
          title: '请检查输入信息',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        const result = await register(
          this.formData.username, 
          this.formData.password, 
          this.formData.nickname
        )
        
        if (result.success) {
          uni.showToast({
            title: result.message,
            icon: 'success'
          })
          
          // 注册成功，跳转到登录页
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/login/login'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: result.message,
            icon: 'none',
            duration: 3000
          })
        }
      } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({
          title: '注册失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    goToLogin() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.app-logo {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.app-title {
  font-size: 64rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 10rpx;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.register-form {
  width: 100%;
  max-width: 500rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 50rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.input-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 14rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #dc3545;
  background: #fff5f5;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #dc3545;
  font-size: 24rpx;
  margin-top: 8rpx;
  display: block;
}

.form-actions {
  margin-top: 50rpx;
}

.register-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 14rpx;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.register-btn:not(:disabled):active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-btn.loading {
  background: #ccc;
}

.form-links {
  text-align: center;
  margin-top: 32rpx;
}

.link-text {
  color: #667eea;
  font-size: 26rpx;
  text-decoration: underline;
  cursor: pointer;
}

.link-text:active {
  color: #5a6fd8;
}

.footer {
  margin-top: auto;
  padding-top: 40rpx;
}

.footer-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
  text-align: center;
}
</style> 