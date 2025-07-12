<template>
  <view class="container">
    <view class="header">
      <view class="app-title">记意 Parli</view>
      <view class="subtitle">意大利语背单词</view>
    </view>
    
    <!-- 当前书籍信息 -->
    <view class="current-book-section">
      <view class="book-info">
        <view class="book-cover">{{ currentBook.cover }}</view>
        <view class="book-details">
          <view class="book-title">{{ currentBook.title }}</view>
          <view class="book-subtitle">{{ currentBook.subtitle }}</view>
          <view class="book-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></view>
            </view>
            <view class="progress-text">{{ progressPercent }}% 完成</view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 学习统计 -->
    <view class="stats-container">
      <view class="stat-card">
        <view class="stat-number">{{ learnedCount }}</view>
        <view class="stat-label">已学单词</view>
      </view>
      <view class="stat-card">
        <view class="stat-number">{{ wrongCount }}</view>
        <view class="stat-label">错题数量</view>
      </view>
      <view class="stat-card">
        <view class="stat-number">{{ currentBook.wordCount }}</view>
        <view class="stat-label">总单词数</view>
      </view>
    </view>
    
    <!-- 功能按钮 -->
    <view class="buttons-container">
      <view class="main-button learn-btn" @click="goLearn">
        <view class="button-icon">📚</view>
        <view class="button-text">
          <view class="button-title">开始学习</view>
          <view class="button-desc">学习新单词</view>
        </view>
      </view>
      
      <view class="main-button review-btn" @click="goReview">
        <view class="button-icon">🔄</view>
        <view class="button-text">
          <view class="button-title">复习模式</view>
          <view class="button-desc">复习错题 ({{ wrongCount }})</view>
        </view>
      </view>
      
      <view class="main-button quiz-btn" @click="goQuiz">
        <view class="button-icon">🎯</view>
        <view class="button-text">
          <view class="button-title">随机抽查</view>
          <view class="button-desc">检验学习成果</view>
        </view>
      </view>
    </view>
    
    <!-- 学习建议 -->
    <view class="suggestion-container" v-if="suggestion">
      <view class="suggestion-icon">💡</view>
      <view class="suggestion-text">{{ suggestion }}</view>
    </view>
  </view>
</template>

<script>
import { 
  getCurrentBook, 
  getCurrentBookWords, 
  getCurrentBookLearnedWords, 
  getCurrentBookWrongWords,
  getBookProgress
} from '@/utils/bookData.js'

export default {
  data() {
    return {
      currentBook: {},
      learnedCount: 0,
      wrongCount: 0,
      progressPercent: 0
    }
  },
  computed: {
    suggestion() {
      if (this.wrongCount > 0) {
        return `您有 ${this.wrongCount} 个错题需要复习，建议先复习巩固！`
      } else if (this.learnedCount < 10) {
        return '开始您的意大利语学习之旅吧！'
      } else if (this.progressPercent < 50) {
        return '学习进展不错，继续保持！'
      } else if (this.progressPercent < 100) {
        return '已经学习了一大半，加油完成这本书！'
      } else {
        return '恭喜完成这本书！可以尝试其他书籍或进行随机抽查！'
      }
    }
  },
  onShow() {
    this.loadStats()
  },
  methods: {
    loadStats() {
      this.currentBook = getCurrentBook()
      const learnedWords = getCurrentBookLearnedWords()
      const wrongWords = getCurrentBookWrongWords()
      
      this.learnedCount = learnedWords.length
      this.wrongCount = wrongWords.length
      
      // 计算进度百分比
      if (this.currentBook.wordCount > 0) {
        this.progressPercent = Math.round((this.learnedCount / this.currentBook.wordCount) * 100)
      } else {
        this.progressPercent = 0
      }
    },
    
    goLearn() {
      uni.navigateTo({
        url: '/pages/learn/learn'
      })
    },
    
    goReview() {
      if (this.wrongCount === 0) {
        uni.showToast({
          title: '暂无错题需要复习',
          icon: 'none'
        })
        return
      }
      
      uni.navigateTo({
        url: '/pages/review/review'
      })
    },
    
    goQuiz() {
      const currentBookWords = getCurrentBookWords()
      const learnedWords = getCurrentBookLearnedWords()
      
      if (currentBookWords.length === 0) {
        uni.showToast({
          title: '当前书籍没有单词',
          icon: 'none'
        })
        return
      }
      
      if (learnedWords.length < 5) {
        uni.showModal({
          title: '提示',
          content: '建议至少学习5个单词后再进行随机抽查，这样测试效果会更好。',
          confirmText: '继续测试',
          cancelText: '去学习',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/quiz/quiz'
              })
            } else {
              this.goLearn()
            }
          }
        })
        return
      }
      
      uni.navigateTo({
        url: '/pages/quiz/quiz'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.app-title {
  font-size: 72rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 32rpx;
  opacity: 0.9;
  font-weight: 300;
}

.current-book-section {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.book-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.book-cover {
  font-size: 80rpx;
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-details {
  flex: 1;
}

.book-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.book-subtitle {
  font-size: 24rpx;
  opacity: 0.8;
  margin-bottom: 20rpx;
}

.book-progress {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FFD700;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  opacity: 0.9;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #FFD700;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.buttons-container {
  margin-bottom: 40rpx;
}

.main-button {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.main-button:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.3);
}

.learn-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
}

.review-btn {
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
}

.quiz-btn {
  background: linear-gradient(135deg, #00cec9 0%, #55efc4 100%);
}

.button-icon {
  font-size: 48rpx;
  margin-right: 30rpx;
}

.button-text {
  flex: 1;
}

.button-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.button-desc {
  font-size: 28rpx;
  opacity: 0.8;
}

.suggestion-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.suggestion-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.suggestion-text {
  font-size: 28rpx;
  line-height: 1.5;
  opacity: 0.9;
}
</style>
