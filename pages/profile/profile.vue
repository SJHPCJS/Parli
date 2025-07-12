<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-section">
      <view class="avatar-container">
        <view class="avatar">👤</view>
        <view class="login-btn" @click="handleLogin">
          <text>{{ userInfo.nickName || '点击登录' }}</text>
        </view>
      </view>
      <view class="user-stats">
        <view class="stat-item">
          <view class="stat-number">{{ totalLearnedWords }}</view>
          <view class="stat-label">总学习词汇</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ totalStudyDays }}</view>
          <view class="stat-label">学习天数</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ totalWrongWords }}</view>
          <view class="stat-label">总错题数</view>
        </view>
      </view>
    </view>

    <!-- 学习成就 -->
    <view class="achievements-section">
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
    <view class="books-progress-section">
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

    <!-- 设置和功能 -->
    <view class="settings-section">
      <view class="section-title">
        <text>⚙️ 设置</text>
      </view>
      <view class="settings-list">
        <view class="setting-item" @click="showStudyStats">
          <view class="setting-icon">📊</view>
          <view class="setting-text">学习统计</view>
          <view class="setting-arrow">></view>
        </view>
        <view class="setting-item" @click="exportAllData">
          <view class="setting-icon">📤</view>
          <view class="setting-text">导出数据</view>
          <view class="setting-arrow">></view>
        </view>
        <view class="setting-item" @click="importData">
          <view class="setting-icon">📥</view>
          <view class="setting-text">导入数据</view>
          <view class="setting-arrow">></view>
        </view>
        <view class="setting-item" @click="resetAllData">
          <view class="setting-icon">🔄</view>
          <view class="setting-text">重置所有数据</view>
          <view class="setting-arrow">></view>
        </view>
        <view class="setting-item" @click="showAbout">
          <view class="setting-icon">ℹ️</view>
          <view class="setting-text">关于应用</view>
          <view class="setting-arrow">></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  bookList, 
  getBookProgress,
  saveBookProgress
} from '@/utils/bookData.js'

export default {
  data() {
    return {
      bookList,
      userInfo: {},
      totalLearnedWords: 0,
      totalStudyDays: 1,
      totalWrongWords: 0,
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
          description: '连续学习7天',
          icon: '🔥',
          unlocked: false,
          condition: (stats) => stats.totalStudyDays >= 7
        }
      ]
    }
  },
  onLoad() {
    this.loadUserData()
  },
  onShow() {
    this.loadUserData()
  },
  methods: {
    loadUserData() {
      // 加载用户信息
      try {
        this.userInfo = uni.getStorageSync('userInfo') || {}
      } catch (e) {
        this.userInfo = {}
      }
      
      // 计算总学习统计
      this.calculateTotalStats()
      
      // 更新成就状态
      this.updateAchievements()
    },
    
    calculateTotalStats() {
      let totalLearned = 0
      let totalWrong = 0
      let completedBooks = 0
      
      bookList.forEach(book => {
        const progress = getBookProgress(book.id)
        totalLearned += progress.learnedWords.length
        totalWrong += progress.wrongWords.length
        
        // 检查是否完成了这本书
        if (progress.learnedWords.length >= book.wordCount) {
          completedBooks++
        }
      })
      
      this.totalLearnedWords = totalLearned
      this.totalWrongWords = totalWrong
      this.completedBooks = completedBooks
      
      // 计算学习天数（简化版本）
      try {
        const firstStudyDate = uni.getStorageSync('firstStudyDate')
        if (firstStudyDate) {
          const now = new Date()
          const firstDate = new Date(firstStudyDate)
          const diffTime = Math.abs(now - firstDate)
          this.totalStudyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        } else {
          // 如果是第一次使用，记录开始时间
          uni.setStorageSync('firstStudyDate', new Date().toISOString())
          this.totalStudyDays = 1
        }
      } catch (e) {
        this.totalStudyDays = 1
      }
    },
    
    updateAchievements() {
      const stats = {
        totalLearnedWords: this.totalLearnedWords,
        totalStudyDays: this.totalStudyDays,
        completedBooks: this.completedBooks
      }
      
      this.achievements.forEach(achievement => {
        achievement.unlocked = achievement.condition(stats)
      })
    },
    
    getBookProgressPercent(bookId) {
      const progress = getBookProgress(bookId)
      const book = bookList.find(b => b.id === bookId)
      if (!book) return 0
      return Math.round((progress.learnedWords.length / book.wordCount) * 100)
    },
    
    handleLogin() {
      // 微信登录功能
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          this.userInfo = res.userInfo
          uni.setStorageSync('userInfo', res.userInfo)
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      })
    },
    
    showStudyStats() {
      let statsText = '📊 详细学习统计\n\n'
      statsText += `总学习词汇：${this.totalLearnedWords}个\n`
      statsText += `学习天数：${this.totalStudyDays}天\n`
      statsText += `总错题数：${this.totalWrongWords}个\n`
      statsText += `完成书籍：${this.completedBooks}本\n\n`
      
      bookList.forEach(book => {
        const progress = getBookProgress(book.id)
        const percent = this.getBookProgressPercent(book.id)
        statsText += `${book.title}：${percent}%\n`
      })
      
      uni.showModal({
        title: '学习统计',
        content: statsText,
        showCancel: false
      })
    },
    
    exportAllData() {
      const exportData = {
        exportTime: new Date().toLocaleString(),
        userInfo: this.userInfo,
        stats: {
          totalLearnedWords: this.totalLearnedWords,
          totalStudyDays: this.totalStudyDays,
          totalWrongWords: this.totalWrongWords
        },
        books: {}
      }
      
      bookList.forEach(book => {
        exportData.books[book.id] = {
          title: book.title,
          progress: getBookProgress(book.id),
          progressPercent: this.getBookProgressPercent(book.id)
        }
      })
      
      uni.showModal({
        title: '导出数据',
        content: '学习数据已生成，请在控制台查看并复制保存。',
        showCancel: false,
        success: () => {
          console.log('Export data:', JSON.stringify(exportData, null, 2))
        }
      })
    },
    
    importData() {
      uni.showModal({
        title: '导入数据',
        content: '此功能需要先导出数据，然后通过开发者工具导入。',
        showCancel: false
      })
    },
    
    resetAllData() {
      uni.showModal({
        title: '重置所有数据',
        content: '确定要重置所有学习数据吗？此操作不可恢复！',
        success: (res) => {
          if (res.confirm) {
            // 重置所有书籍进度
            bookList.forEach(book => {
              const emptyProgress = {
                learnedWords: [],
                wrongWords: [],
                reviewWords: []
              }
              saveBookProgress(book.id, emptyProgress)
            })
            
            // 重置用户数据
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('firstStudyDate')
            
            // 重新加载数据
            this.loadUserData()
            
            uni.showToast({
              title: '重置成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    showAbout() {
      uni.showModal({
        title: '关于记意 Parli',
        content: '记意 Parli v1.0\n\n一个简洁高效的意大利语单词学习应用\n\n功能特色：\n• 多书籍学习系统\n• 智能错题复习\n• 学习进度追踪\n• 随机抽查测试\n\n让意大利语学习变得更简单！',
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 50rpx;
  margin-bottom: 40rpx;
  backdrop-filter: blur(10px);
  text-align: center;
}

.avatar-container {
  margin-bottom: 40rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin: 0 auto 30rpx auto;
}

.login-btn {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  gap: 20rpx;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.achievements-section,
.books-progress-section,
.settings-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 30rpx;
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.achievement-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  position: relative;
  opacity: 0.5;
}

.achievement-card.unlocked {
  opacity: 1;
  background: rgba(255, 215, 0, 0.2);
}

.achievement-icon {
  font-size: 48rpx;
  margin-right: 30rpx;
}

.achievement-info {
  flex: 1;
  color: white;
}

.achievement-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.achievement-desc {
  font-size: 24rpx;
  opacity: 0.8;
}

.achievement-badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #FFD700;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #333;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
}

.book-icon {
  font-size: 40rpx;
  margin-right: 30rpx;
}

.book-info {
  flex: 1;
  color: white;
}

.book-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.progress-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  opacity: 0.8;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  color: white;
  transition: all 0.3s ease;
}

.setting-item:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

.setting-icon {
  font-size: 32rpx;
  margin-right: 30rpx;
}

.setting-text {
  flex: 1;
  font-size: 28rpx;
}

.setting-arrow {
  font-size: 24rpx;
  opacity: 0.6;
}
</style> 