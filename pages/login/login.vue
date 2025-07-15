<template>
  <view class="login-container">
    <view class="header">
      <view class="app-logo">📖</view>
      <view class="app-title">记意 Parli</view>
      <view class="app-subtitle">意大利语背单词</view>
    </view>
    
    <view class="login-form">
      <view class="form-title">用户登录</view>
      
      <view class="input-group">
        <view class="input-label">
          <text class="input-icon">👤</text>
          <text>用户名</text>
        </view>
        <input 
          v-model="formData.username"
          class="form-input"
          placeholder="请输入用户名（至少3个字符）"
          :disabled="loading"
          maxlength="20"
        />
      </view>
      
      <view class="input-group">
        <view class="input-label">
          <text class="input-icon">🔒</text>
          <text>密码</text>
        </view>
        <input 
          v-model="formData.password"
          class="form-input"
          placeholder="请输入密码（至少6个字符）"
          password
          :disabled="loading"
          maxlength="50"
        />
      </view>
      
      <view class="form-actions">
        <button 
          class="login-btn"
          :class="{ 'loading': loading }"
          :disabled="loading || !isFormValid"
          @click="handleLogin"
        >
          <text v-if="loading">登录中...</text>
          <text v-else>登录</text>
        </button>
        
        <view class="form-links">
          <text class="link-text" @click="goToRegister">没有账号？立即注册</text>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">登录后您的学习进度将自动保存</text>
    </view>
  </view>
</template>

<script>
import { login } from '@/utils/userManager.js'
import userManager, { migrateTempDataToUser, getTempData } from '@/utils/userManager.js'

export default {
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  
  computed: {
    isFormValid() {
      return this.formData.username.length >= 3 && 
             this.formData.password.length >= 6
    }
  },
  
  methods: {
    // 检查是否有临时学习数据
    checkTempData() {
      const hasLearningData = getTempData('learned_words_book_1', []).length > 0 ||
                             getTempData('wrong_words_book_1', []).length > 0
      return hasLearningData
    },
    
    // 数据迁移提示
    async showMigrationPrompt() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '发现本地学习数据',
          content: '检测到您之前在未登录状态下学习了一些单词，是否要将这些学习记录导入到您的账户中？',
          confirmText: '导入数据',
          cancelText: '忽略',
          success: (res) => {
            resolve(res.confirm)
          }
        })
      })
    },
    
    async handleLogin() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请检查输入信息',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        const result = await login(this.formData.username, this.formData.password)
        
        if (result.success) {
          // 检查是否有临时数据需要迁移
          const hasTempData = this.checkTempData()
          
          if (hasTempData) {
            // 显示数据迁移选项
            const shouldMigrate = await this.showMigrationPrompt()
            
            if (shouldMigrate) {
              try {
                const migrationResult = await migrateTempDataToUser()
                if (migrationResult.success) {
                  uni.showToast({
                    title: migrationResult.message,
                    icon: 'success'
                  })
                } else {
                  uni.showToast({
                    title: migrationResult.message,
                    icon: 'none'
                  })
                }
              } catch (error) {
                console.error('数据迁移失败:', error)
                uni.showToast({
                  title: '数据导入失败，但登录成功',
                  icon: 'none'
                })
              }
            }
          } else {
            // 没有临时数据，直接显示登录成功
            uni.showToast({
              title: result.message,
              icon: 'success'
            })
          }
          
          // 登录成功，跳转到首页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 2000)
        } else {
          uni.showToast({
            title: result.message,
            icon: 'none',
            duration: 3000
          })
        }
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.app-logo {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.app-title {
  font-size: 72rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 10rpx;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.login-form {
  width: 100%;
  max-width: 500rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

.input-icon {
  margin-right: 12rpx;
  font-size: 36rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 60rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16rpx;
  color: white;
  font-size: 36rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.login-btn:not(:disabled):active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-btn.loading {
  background: #ccc;
}

.form-links {
  text-align: center;
  margin-top: 40rpx;
}

.link-text {
  color: #667eea;
  font-size: 28rpx;
  text-decoration: underline;
  cursor: pointer;
}

.link-text:active {
  color: #5a6fd8;
}

.footer {
  margin-top: auto;
  padding-top: 60rpx;
}

.footer-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  text-align: center;
}
</style> 