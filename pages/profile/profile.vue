<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-section">
      <view class="avatar-container">
        <view class="avatar">👤</view>
        <view class="user-info">
          <view class="user-name">{{ currentUser ? currentUser.nickname : '未登录' }}</view>
          <view class="user-subtitle">
            <text v-if="currentUser">@{{ currentUser.username }}</text>
            <text v-else>点击右上角登录</text>
          </view>
        </view>
        <view class="login-status">
          <button v-if="!isLoggedIn" class="login-btn" @click="goToLogin">
            登录
          </button>
          <button v-else class="logout-btn" @click="handleLogout">
            退出
          </button>
        </view>
      </view>
      
      <view v-if="currentUser" class="user-stats">
        <view class="stat-item">
          <view class="stat-number">{{ totalLearnedWords }}</view>
          <view class="stat-label">总学习词汇</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ userStats ? userStats.registeredDays : 0 }}</view>
          <view class="stat-label">注册天数</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ totalWrongWords }}</view>
          <view class="stat-label">总错题数</view>
        </view>
      </view>
    </view>

    <!-- 学习成就 -->
    <view v-if="isLoggedIn" class="achievements-section">
      <view class="section-title">
        <text>🏆 学习成就</text>
      </view>
      <view class="achievements-grid">
        <view 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ 'unlocked': achievement.unlocked }"
        >
          <view class="achievement-icon">{{ achievement.icon }}</view>
          <view class="achievement-info">
            <view class="achievement-title">{{ achievement.title }}</view>
            <view class="achievement-desc">{{ achievement.description }}</view>
          </view>
          <view v-if="achievement.unlocked" class="achievement-badge">✓</view>
        </view>
      </view>
    </view>

    <!-- 书籍学习进度 -->
    <view v-if="isLoggedIn" class="books-progress-section">
      <view class="section-title">
        <text>📚 书籍进度</text>
      </view>
      <view class="books-progress-list">
        <view 
          v-for="book in bookList" 
          :key="book.id"
          class="book-progress-item"
        >
          <view class="book-icon">{{ book.cover }}</view>
          <view class="book-info">
            <view class="book-title">{{ book.title }}</view>
            <view class="progress-bar">
              <view 
                class="progress-fill"
                :style="{ width: getBookProgressPercent(book.id) + '%', backgroundColor: book.color }"
              ></view>
            </view>
            <view class="progress-text">{{ getBookProgressPercent(book.id) }}%</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户信息详情 -->
    <view v-if="isLoggedIn" class="user-details-section">
      <view class="section-title">
        <text>👤 账户信息</text>
      </view>
      <view class="details-list">
        <view class="detail-item">
          <view class="detail-label">用户名</view>
          <view class="detail-value">{{ currentUser.username }}</view>
        </view>
        <view class="detail-item">
          <view class="detail-label">昵称</view>
          <view class="detail-value">{{ currentUser.nickname }}</view>
        </view>
        <view class="detail-item">
          <view class="detail-label">注册时间</view>
          <view class="detail-value">{{ formatDate(currentUser.createdAt) }}</view>
        </view>
        <view class="detail-item">
          <view class="detail-label">最后登录</view>
          <view class="detail-value">{{ formatDate(currentUser.lastLoginAt) }}</view>
        </view>
      </view>
    </view>

    <!-- 设置和功能 -->
    <view class="settings-section">
      <view class="section-title">
        <text>⚙️ 设置</text>
      </view>
      <view class="settings-list">
        <view v-if="isLoggedIn" class="setting-item" @click="showStudyStats">
          <view class="setting-icon">📊</view>
          <view class="setting-text">学习统计</view>
          <view class="setting-arrow">></view>
        </view>
        <view class="setting-item" @click="showAbout">
          <view class="setting-icon">ℹ️</view>
          <view class="setting-text">关于应用</view>
          <view class="setting-arrow">></view>
        </view>
        <view v-if="isLoggedIn" class="setting-item danger" @click="confirmLogout">
          <view class="setting-icon">🚪</view>
          <view class="setting-text">退出登录</view>
          <view class="setting-arrow">></view>
        </view>
      </view>
    </view>

    <!-- 未登录状态提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="prompt-icon">🔐</view>
      <view class="prompt-title">登录以保存学习进度</view>
      <view class="prompt-desc">登录后您的学习记录将自动云端保存，换设备也不会丢失</view>
      <button class="prompt-login-btn" @click="goToLogin">立即登录</button>
      <button class="prompt-register-btn" @click="goToRegister">注册新账号</button>
    </view>
  </view>
</template>

<script>
import { 
  bookList, 
  getCurrentBook,
  getCurrentBookLearnedWordsWithCache,
  getCurrentBookWrongWordsWithCache
} from '@/utils/bookData.js'
import userManager, { 
  isLoggedIn, 
  getCurrentUser, 
  logout, 
  getUserStats 
} from '@/utils/userManager.js'

export default {
  data() {
    return {
      bookList,
      currentUser: null,
      userStats: null,
      totalLearnedWords: 0,
      totalWrongWords: 0,
      completedBooks: 0,
      achievements: [
        {
          id: 1,
          title: '初学者',
          description: '学习第一个单词',
          icon: '🌱',
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 1
        },
        {
          id: 2,
          title: '勤学者',
          description: '学习50个单词',
          icon: '📚',
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 50
        },
        {
          id: 3,
          title: '进步者',
          description: '学习100个单词',
          icon: '🚀',
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 100
        },
        {
          id: 4,
          title: '专家级',
          description: '学习200个单词',
          icon: '👑',
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 200
        },
        {
          id: 5,
          title: '完美主义者',
          description: '完成一本书的学习',
          icon: '💯',
          unlocked: false,
          condition: (stats) => stats.completedBooks >= 1
        },
        {
          id: 6,
          title: '坚持者',
          description: '注册7天以上',
          icon: '🔥',
          unlocked: false,
          condition: (stats) => stats.registeredDays >= 7
        }
      ]
    }
  },
  
  computed: {
    isLoggedIn() {
      return isLoggedIn()
    }
  },
  
  onLoad() {
    this.loadUserData()
  },
  
  onShow() {
    this.loadUserData()
  },
  
  onLoad() {
    // 监听学习完成事件
    uni.$on('learningComplete', () => {
      this.loadUserData() // 重新加载用户数据
    })
  },
  
  onUnload() {
    // 移除事件监听
    uni.$off('learningComplete')
  },
  
  methods: {
    loadUserData() {
      // 加载用户信息
      this.currentUser = getCurrentUser()
      this.userStats = getUserStats()
      
      if (this.isLoggedIn) {
        // 计算总学习统计
        this.calculateTotalStats()
        
        // 更新成就状态
        this.updateAchievements()
      }
    },
    
    async calculateTotalStats() {
      try {
        let totalLearned = 0
        let totalWrong = 0
        let completedBooks = 0
        
        if (bookList && bookList.length > 0) {
          // 由于我们只有一本书，直接获取当前书的数据
          const learnedWords = await getCurrentBookLearnedWordsWithCache()
          const wrongWords = await getCurrentBookWrongWordsWithCache()
          
          totalLearned = learnedWords.length
          totalWrong = wrongWords.length
          
          // 检查是否完成了这本书
          const currentBook = await getCurrentBook()
          if (currentBook && learnedWords.length >= currentBook.wordCount) {
            completedBooks = 1
          }
        }
        
        this.totalLearnedWords = totalLearned
        this.totalWrongWords = totalWrong
        this.completedBooks = completedBooks
      } catch (error) {
        console.error('计算统计失败:', error)
        this.totalLearnedWords = 0
        this.totalWrongWords = 0
        this.completedBooks = 0
      }
    },
    
    updateAchievements() {
      const stats = {
        totalLearnedWords: this.totalLearnedWords,
        registeredDays: this.userStats ? this.userStats.registeredDays : 0,
        completedBooks: this.completedBooks
      }
      
      this.achievements.forEach(achievement => {
        achievement.unlocked = achievement.condition(stats)
      })
    },
    
    getBookProgressPercent(bookId) {
      if (!this.isLoggedIn) return 0
      
      try {
        const book = bookList.find(b => b.id === bookId)
        if (!book) return 0
        
        const learnedWords = getCurrentBookLearnedWords()
        const percent = Math.round((learnedWords.length / book.wordCount) * 100)
        return Math.min(percent, 100)
      } catch (error) {
        return 0
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '未知'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return '未知'
      }
    },
    
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },
    
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    },
    
    confirmLogout() {
      uni.showModal({
        title: '确认退出',
        content: '退出登录后，您需要重新登录才能查看学习进度。确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            this.handleLogout()
          }
        }
      })
    },
    
    handleLogout() {
      const result = logout()
      if (result.success) {
        uni.showToast({
          title: result.message,
          icon: 'success'
        })
        
        // 清除本地数据
        this.currentUser = null
        this.userStats = null
        this.totalLearnedWords = 0
        this.totalWrongWords = 0
        this.completedBooks = 0
        
        // 跳转到登录页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    showStudyStats() {
      const stats = `学习统计：
      
总学习词汇：${this.totalLearnedWords} 个
总错题数：${this.totalWrongWords} 个
完成书籍：${this.completedBooks} 本
注册天数：${this.userStats ? this.userStats.registeredDays : 0} 天

继续努力学习意大利语！🇮🇹`
      
      uni.showModal({
        title: '📊 学习统计',
        content: stats,
        showCancel: false
      })
    },
    
    showAbout() {
      const about = `记意 Parli v1.0

一款专为中文用户设计的意大利语学习应用

📖 词典：45893个词条
🎯 功能：学习、复习、测试
🌟 特色：多用户、进度保存、成就系统

让意大利语学习变得简单有趣！`
      
      uni.showModal({
        title: 'ℹ️ 关于应用',
        content: about,
        showCancel: false
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
}

.user-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.avatar-container {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-right: 30rpx;
  color: white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-subtitle {
  font-size: 28rpx;
  color: #666;
}

.login-status {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.login-btn, .logout-btn {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.logout-btn {
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #e9ecef;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  gap: 20rpx;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.achievements-section, .books-progress-section, .user-details-section, .settings-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.achievement-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  border: 2rpx solid #4CAF50;
}

.achievement-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.achievement-desc {
  font-size: 24rpx;
  color: #666;
}

.achievement-badge {
  color: #4CAF50;
  font-size: 32rpx;
  font-weight: bold;
}

.books-progress-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.book-progress-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.book-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 8rpx;
  background: #e9ecef;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.setting-item:active {
  background-color: rgba(102, 126, 234, 0.1);
}

.setting-item.danger {
  color: #dc3545;
}

.setting-item.danger .setting-text {
  color: #dc3545;
}

.setting-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
  width: 32rpx;
  text-align: center;
}

.setting-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.setting-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.login-prompt {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.prompt-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.prompt-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.prompt-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.prompt-login-btn, .prompt-register-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.prompt-login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.prompt-register-btn {
  background: #f8f9fa;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.prompt-login-btn:active, .prompt-register-btn:active {
  transform: scale(0.98);
}
</style> 