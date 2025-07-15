<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-bar">
        <view class="search-input-container">
          <input 
            v-model="searchQuery" 
            placeholder="输入中文或意大利语单词..." 
            class="search-input"
            @input="onSearchInput"
            confirm-type="search"
            @confirm="performSearch"
          />
          <button class="search-btn" @click="performSearch">
            <text class="search-icon">🔍</text>
          </button>
        </view>
      </view>
      
      <!-- 搜索提示 -->
      <view class="search-tips" v-if="!searchQuery">
        <text class="tip-text">💡 支持中文和意大利语搜索</text>
      </view>
    </view>
    
    <!-- 搜索结果 -->
    <view class="results-section" v-if="searchResults.length > 0">
      <view class="results-header">
        <text class="results-title">搜索结果</text>
        <text class="results-count">共{{searchResults.length}}条</text>
      </view>
      
      <view class="results-list">
        <view 
          v-for="word in searchResults" 
          :key="word.id"
          class="word-item"
          @click="goToWordDetail(word)"
        >
          <view class="word-main">
            <view class="word-text">{{ word.word }}</view>
            <view class="word-pos">{{ posMap[word.pos] }}</view>
          </view>
          <view class="word-meaning">{{ word.meaning }}</view>
          <view class="word-status">
            <view class="status-dot" :class="{ active: isWordLearned(word.id) }"></view>
            <text class="status-text">{{ isWordLearned(word.id) ? '已学' : '未学' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 无搜索结果 -->
    <view class="no-results" v-if="hasSearched && searchResults.length === 0">
      <view class="no-results-icon">🔍</view>
      <view class="no-results-title">未找到相关单词</view>
      <view class="no-results-desc">请尝试其他搜索词汇</view>
    </view>
    
    <!-- 搜索历史 -->
    <view class="history-section" v-if="!hasSearched && searchHistory.length > 0">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <button class="clear-history-btn" @click="clearHistory">清空</button>
      </view>
      <view class="history-list">
        <view 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-item"
          @click="searchFromHistory(item)"
        >
          <text class="history-text">{{ item }}</text>
        </view>
      </view>
    </view>
    
    <!-- 热门词汇推荐 -->
    <view class="recommend-section" v-if="!hasSearched && searchHistory.length === 0">
      <view class="recommend-header">
        <text class="recommend-title">推荐词汇</text>
      </view>
      <view class="recommend-list">
        <view 
          v-for="word in recommendWords" 
          :key="word.id"
          class="recommend-item"
          @click="goToWordDetail(word)"
        >
          <view class="recommend-word">{{ word.word }}</view>
          <view class="recommend-meaning">{{ word.meaning }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  searchWordOnly, 
  getCurrentBookLearnedWords
} from '@/utils/bookData.js'
import { posMap } from '@/utils/wordData.js'

export default {
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      hasSearched: false,
      searchHistory: [],
      recommendWords: [],
      allWords: [],
      learnedWords: [],
      posMap
    }
  },
  onLoad() {
    this.loadData()
    this.loadSearchHistory()
    this.loadRecommendWords()
  },
  methods: {
    loadData() {
      // 使用纯查询功能，不影响学习状态
      this.allWords = []  // 将在搜索时动态获取
      this.learnedWords = getCurrentBookLearnedWords()
    },
    
    loadSearchHistory() {
      try {
        const history = uni.getStorageSync('search_history') || []
        this.searchHistory = history.slice(0, 10) // 最多显示10条历史记录
      } catch (e) {
        this.searchHistory = []
      }
    },
    
    loadRecommendWords() {
      // 使用搜索功能获取推荐词汇
      // 搜索一些常用字母，获取推荐结果
      const commonLetters = ['a', 'e', 'i', 'o', 'u', 'c', 'l', 'm', 'n', 'r', 's', 't']
      const randomLetter = commonLetters[Math.floor(Math.random() * commonLetters.length)]
      const words = searchWordOnly(randomLetter)
      const shuffled = [...words].sort(() => 0.5 - Math.random())
      this.recommendWords = shuffled.slice(0, 20)
    },
    
    onSearchInput() {
      // 实时搜索
      if (this.searchQuery.trim()) {
        this.performSearch()
      } else {
        this.searchResults = []
        this.hasSearched = false
      }
    },
    
    performSearch() {
      const query = this.searchQuery.trim()
      if (!query) {
        this.searchResults = []
        this.hasSearched = false
        return
      }
      
      this.hasSearched = true
      
      // 使用纯查询功能，不影响学习状态
      const results = searchWordOnly(query)
      
      // 按相关度排序（精确匹配优先）
      this.searchResults = results.sort((a, b) => {
        const aWordExact = a.word.toLowerCase() === query.toLowerCase()
        const bWordExact = b.word.toLowerCase() === query.toLowerCase()
        const aMeaningExact = a.meaning === query
        const bMeaningExact = b.meaning === query
        
        if (aWordExact && !bWordExact) return -1
        if (!aWordExact && bWordExact) return 1
        if (aMeaningExact && !bMeaningExact) return -1
        if (!aMeaningExact && bMeaningExact) return 1
        
        return 0
      })
      
      // 保存搜索历史
      this.saveSearchHistory(query)
    },
    
    saveSearchHistory(query) {
      try {
        let history = uni.getStorageSync('search_history') || []
        
        // 移除重复项
        history = history.filter(item => item !== query)
        
        // 添加到开头
        history.unshift(query)
        
        // 限制历史记录数量
        history = history.slice(0, 50)
        
        uni.setStorageSync('search_history', history)
        this.searchHistory = history.slice(0, 10)
      } catch (e) {
        console.error('保存搜索历史失败:', e)
      }
    },
    
    searchFromHistory(query) {
      this.searchQuery = query
      this.performSearch()
    },
    
    clearHistory() {
      uni.showModal({
        title: '确认',
        content: '确定要清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            try {
              uni.removeStorageSync('search_history')
              this.searchHistory = []
              uni.showToast({
                title: '已清空历史记录',
                icon: 'success'
              })
            } catch (e) {
              console.error('清空历史记录失败:', e)
            }
          }
        }
      })
    },
    
    isWordLearned(wordId) {
      return this.learnedWords.some(word => word.id === wordId)
    },
    
    goToWordDetail(word) {
      // 传递 queryMode=true 参数，表示这是查词模式，不影响学习状态
      uni.navigateTo({
        url: `/pages/wordDetail/wordDetail?wordId=${word.id}&fromPage=search&queryMode=true`
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

.search-section {
  margin-bottom: 40rpx;
}

.search-bar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 20rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-input {
  flex: 1;
  background: #f8f9fa;
  border: 2rpx solid transparent;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 32rpx;
  color: #333;
}

.search-input:focus {
  border-color: #667eea;
  outline: none;
}

.search-btn {
  width: 80rpx;
  height: 80rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  font-size: 32rpx;
}

.search-tips {
  text-align: center;
  margin-top: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.tip-text {
  font-size: 24rpx;
}

.results-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.results-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.results-count {
  font-size: 24rpx;
  color: #666;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.word-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  position: relative;
}

.word-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.word-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.word-pos {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.word-meaning {
  font-size: 28rpx;
  color: #666;
  margin-top: 8rpx;
}

.word-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  position: absolute;
  top: 24rpx;
  right: 24rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ddd;
}

.status-dot.active {
  background: #4CAF50;
}

.status-text {
  font-size: 20rpx;
  color: #666;
}

.no-results {
  text-align: center;
  padding: 100rpx 40rpx;
  color: rgba(255, 255, 255, 0.8);
}

.no-results-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.no-results-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.no-results-desc {
  font-size: 28rpx;
  opacity: 0.7;
}

.history-section, .recommend-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.history-title, .recommend-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.clear-history-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.history-item {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #333;
}

.recommend-header {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.recommend-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  width: 48%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.recommend-word {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.recommend-meaning {
  font-size: 24rpx;
  color: #666;
}
</style> 