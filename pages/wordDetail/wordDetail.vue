<template>
  <view class="container">
    <view class="word-card">
      <!-- 词汇主要信息 -->
      <view class="word-header">
        <view class="word-title">{{ wordData.word }}</view>
        <view class="word-meta">
          <view class="word-pos">{{ posMap[wordData.pos] || wordData.pos }}</view>
          <view class="word-id">ID: {{ wordData.id }}</view>
        </view>
      </view>

      <!-- 发音按钮 -->
      <view class="pronunciation-section">
        <button class="pronunciation-btn" @click="playPronunciation">
          <text class="pronunciation-icon">🔊</text>
          <text>点击发音</text>
        </button>
      </view>

      <!-- 释义部分 -->
      <view class="meanings-section">
        <view class="section-title">📝 释义</view>
        <view class="meanings-list">
          <view v-for="(meaning, index) in wordData.meanings" :key="index" class="meaning-item">
            <view class="meaning-number">{{ index + 1 }}</view>
            <view class="meaning-text">{{ meaning }}</view>
          </view>
        </view>
      </view>

      <!-- 例句部分 -->
      <view v-if="wordData.examples && wordData.examples.length > 0" class="examples-section">
        <view class="section-title">💡 例句</view>
        <view class="examples-list">
          <view v-for="(example, index) in wordData.examples" :key="index" class="example-item">
            {{ example }}
          </view>
        </view>
      </view>

      <!-- 完整内容 -->
      <view v-if="wordData.fullContent" class="full-content-section">
        <view class="section-title">📚 完整释义</view>
        <view class="full-content-text">{{ wordData.fullContent }}</view>
      </view>

      <!-- 学习状态 (非查词模式下显示) -->
      <view class="status-section" v-if="!queryMode">
        <view class="section-title">学习状态</view>
        <view class="status-badges">
          <view class="status-badge" :class="{ active: isLearned }">
            <text class="badge-icon">✓</text>
            <text>已学会</text>
          </view>
          <view class="status-badge" :class="{ active: isWrong }">
            <text class="badge-icon">✗</text>
            <text>错题</text>
          </view>
        </view>
      </view>
      
      <!-- 查词模式提示 -->
      <view class="query-tip" v-if="queryMode">
        <text class="tip-icon">📖</text>
        <text class="tip-text">当前为查词模式，不会影响学习进度</text>
      </view>
      
      <!-- 操作按钮 (非查词模式下显示) -->
      <view class="action-section" v-if="!queryMode">
        <button class="action-btn mark-btn" @click="toggleLearned">
          {{ isLearned ? '标记为未学' : '标记为已学' }}
        </button>
        <button class="action-btn wrong-btn" @click="toggleWrong">
          {{ isWrong ? '移出错题' : '加入错题' }}
        </button>
      </view>
      
      <!-- 继续学习按钮 -->
      <view class="continue-section" v-if="showContinue">
        <button class="continue-btn" @click="continueNext">
          <text class="continue-icon">→</text>
          <text>继续下一个</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getCurrentBookWords, 
  getCurrentBookLearnedWords, 
  getCurrentBookWrongWords,
  addLearnedWordToCurrentBook,
  removeLearnedWordFromCurrentBook,
  addWrongWordToCurrentBook,
  removeWrongWordFromCurrentBook,
  getFullWordDetail
} from '@/utils/bookData.js'
import { posMap } from '@/utils/wordData.js'

export default {
  data() {
    return {
      wordData: {},
      isLearned: false,
      isWrong: false,
      showContinue: false,
      fromPage: '', // 来源页面：learn, review, search
      queryMode: false, // 查词模式，不影响学习状态
      posMap
    }
  },
  onLoad(options) {
    // 接收参数：wordId, fromPage, queryMode
    const { wordId, fromPage, queryMode } = options
    this.fromPage = fromPage || 'search'
    this.queryMode = queryMode === 'true' // 字符串转布尔值
    this.showContinue = (fromPage === 'learn' || fromPage === 'review') && !this.queryMode
    
    // 根据 wordId 查找单词数据
    this.loadWordData(wordId)
    if (!this.queryMode) {
      this.loadWordStatus(wordId)
    }
  },
  methods: {
    loadWordData(wordId) {
      const fullDetail = getFullWordDetail(wordId)
      if (fullDetail) {
        this.wordData = {
          ...fullDetail,
          meanings: fullDetail.meanings || [fullDetail.meaning],
          examples: fullDetail.examples || [],
          fullContent: fullDetail.fullContent || ''
        }
      } else {
        // 备选方案：从所有词汇中查找
        const allWords = getCurrentBookWords()
        this.wordData = allWords.find(word => word.id == wordId) || {}
        if (this.wordData.id) {
          this.wordData.meanings = this.wordData.meanings || [this.wordData.meaning]
          this.wordData.examples = this.wordData.examples || []
          this.wordData.fullContent = this.wordData.fullContent || ''
        }
      }
      
      if (!this.wordData.id) {
        uni.showToast({
          title: '单词不存在',
          icon: 'error'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
    
    loadWordStatus(wordId) {
      const learnedWords = getCurrentBookLearnedWords()
      const wrongWords = getCurrentBookWrongWords()
      
      this.isLearned = learnedWords.some(word => word.id == wordId)
      this.isWrong = wrongWords.some(word => word.id == wordId)
    },
    
    playPronunciation() {
      // 简单的发音提示
      uni.showToast({
        title: '发音：' + this.wordData.word,
        icon: 'none',
        duration: 2000
      })
    },
    
    toggleLearned() {
      if (this.queryMode) {
        uni.showToast({
          title: '查词模式下无法操作',
          icon: 'none'
        })
        return
      }
      
      if (this.isLearned) {
        removeLearnedWordFromCurrentBook(this.wordData.id)
        this.isLearned = false
        uni.showToast({
          title: '已移出已学词汇',
          icon: 'success'
        })
      } else {
        addLearnedWordToCurrentBook(this.wordData.id)
        this.isLearned = true
        uni.showToast({
          title: '已标记为已学',
          icon: 'success'
        })
      }
    },
    
    toggleWrong() {
      if (this.queryMode) {
        uni.showToast({
          title: '查词模式下无法操作',
          icon: 'none'
        })
        return
      }
      
      if (this.isWrong) {
        removeWrongWordFromCurrentBook(this.wordData.id)
        this.isWrong = false
        uni.showToast({
          title: '已移出错题',
          icon: 'success'
        })
      } else {
        addWrongWordToCurrentBook(this.wordData.id)
        this.isWrong = true
        uni.showToast({
          title: '已加入错题',
          icon: 'success'
        })
      }
    },
    
    continueNext() {
      // 返回到学习或复习页面
      uni.navigateBack({
        success: () => {
          // 通过事件或全局变量通知上个页面继续下一题
          uni.$emit('continueNext')
        }
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

.word-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.word-header {
  text-align: center;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.word-title {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.word-meta {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.word-pos {
  background: #e3f2fd;
  color: #1976d2;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  display: inline-block;
}

.word-id {
  background: #f5f5f5;
  color: #999;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  display: inline-block;
}

.pronunciation-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.pronunciation-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 30rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 200rpx;
  margin: 0 auto;
}

.pronunciation-icon {
  font-size: 32rpx;
}

.meanings-section, .examples-section, .full-content-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.meanings-list, .examples-list {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 36rpx;
  color: #444;
  line-height: 1.6;
}

.meaning-item, .example-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.meaning-number, .example-number {
  font-size: 28rpx;
  color: #666;
  margin-right: 15rpx;
  min-width: 40rpx;
}

.meaning-text, .example-text {
  flex: 1;
}

.full-content-text {
  font-size: 36rpx;
  color: #444;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
}

.status-badges {
  display: flex;
  gap: 20rpx;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  color: #999;
  font-size: 24rpx;
}

.status-badge.active {
  background: #e8f5e8;
  color: #4CAF50;
}

.badge-icon {
  font-size: 20rpx;
}

.action-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.mark-btn {
  background: #2196F3;
  color: white;
}

.wrong-btn {
  background: #FF9800;
  color: white;
}

.continue-section {
  text-align: center;
  margin-top: 40rpx;
}

.continue-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 300rpx;
  margin: 0 auto;
}

.continue-icon {
  font-size: 36rpx;
}

/* 查词模式提示样式 */
.query-tip {
  background: #e3f2fd;
  border: 2rpx solid #2196f3;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #1976d2;
  line-height: 1.4;
}
</style> 