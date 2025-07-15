<template>
  <view class="container">
    <!-- 页面头部 -->
    <view class="header">
      <view class="title">{{ pageTitle }}</view>
      <view class="count">共 {{ filteredWords.length }} 个单词</view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-bar">
        <input 
          v-model="searchQuery" 
          placeholder="搜索单词..." 
          class="search-input"
          @input="onSearchInput"
        />
        <text class="search-icon">🔍</text>
      </view>
    </view>
    
    <!-- A-Z字母索引 -->
    <view class="alphabet-nav">
      <view 
        v-for="letter in alphabet" 
        :key="letter" 
        class="alphabet-item" 
        :class="{ 'active': currentLetter === letter, 'has-words': letterGroups[letter] && letterGroups[letter].length > 0 }"
        @click="scrollToLetter(letter)"
      >
        {{ letter }}
      </view>
    </view>
    
    <!-- 单词列表 -->
    <scroll-view class="word-list" scroll-y="true" :scroll-into-view="scrollIntoView">
      <view v-if="filteredWords.length === 0" class="empty-state">
        <view class="empty-icon">📝</view>
        <view class="empty-text">{{ emptyText }}</view>
      </view>
      
      <view v-else>
        <view v-for="letter in sortedLetters" :key="letter" class="letter-section" :id="`letter-${letter}`">
          <view class="letter-header">{{ letter }}</view>
          <view class="words-group">
            <view 
              v-for="word in letterGroups[letter]" 
              :key="word.id" 
              class="word-item"
              @click="goToWordDetail(word)"
            >
              <view class="word-left">
                <view class="italian-word">{{ word.word }}</view>
                <view class="word-meta">
                  <text class="pos-tag">{{ posMap[word.pos] || word.pos }}</text>
                  <text class="word-id">ID: {{ word.id }}</text>
                </view>
              </view>
              <view class="word-right">
                <view class="chinese-meaning">{{ word.meaning }}</view>
                <view class="word-status" v-if="listType !== 'all'">
                  <text class="status-dot" :class="getStatusClass(word)"></text>
                  <text class="status-text">{{ getStatusText(word) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { 
  getCurrentBookWords,
  getCurrentBookWordsAsync,
  getCurrentBookWordsWithCache,
  getCurrentBookLearnedWordsAsync,
  getCurrentBookLearnedWordsWithCache,
  getCurrentBookWrongWordsAsync,
  getCurrentBookWrongWordsWithCache,
  getFullWordDetail
} from '@/utils/bookData.js'
import { posMap } from '@/utils/wordData.js'

export default {
  data() {
    return {
      listType: 'all', // 'learned', 'wrong', 'all'
      words: [],
      searchQuery: '',
      currentLetter: '',
      scrollIntoView: '',
      posMap: posMap || {},
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    }
  },
  
  computed: {
    pageTitle() {
      const titles = {
        'learned': '✅ 已学单词',
        'wrong': '❌ 错题本',
        'all': '📖 所有单词'
      }
      return titles[this.listType] || '单词列表'
    },
    
    emptyText() {
      const texts = {
        'learned': '还没有学过任何单词，去学习吧！',
        'wrong': '没有错题，学习状态很好！',
        'all': '没有找到单词数据'
      }
      return texts[this.listType] || '暂无数据'
    },
    
    filteredWords() {
      if (!this.searchQuery) return this.words
      
      const query = this.searchQuery.toLowerCase()
      return this.words.filter(word => 
        word.word.toLowerCase().includes(query) || 
        word.meaning.includes(this.searchQuery)
      )
    },
    
    letterGroups() {
      const groups = {}
      this.alphabet.forEach(letter => {
        groups[letter] = []
      })
      
      this.filteredWords.forEach(word => {
        const firstLetter = word.word.charAt(0).toUpperCase()
        if (this.alphabet.includes(firstLetter)) {
          groups[firstLetter].push(word)
        } else {
          groups['Z'].push(word) // 非英文字母归类到Z
        }
      })
      
      // 对每个字母组内的单词进行排序
      Object.keys(groups).forEach(letter => {
        groups[letter].sort((a, b) => a.word.localeCompare(b.word))
      })
      
      return groups
    },
    
    sortedLetters() {
      return this.alphabet.filter(letter => 
        this.letterGroups[letter] && this.letterGroups[letter].length > 0
      )
    }
  },
  
  onLoad(options) {
    this.listType = options.type || 'all'
    this.loadWords()
  },
  
  methods: {
    async loadWords() {
      try {
        uni.showLoading({ title: '加载中...' })
        
        let wordData = []
        
        if (this.listType === 'learned') {
          // 使用带缓存的已学单词函数
          wordData = await getCurrentBookLearnedWordsWithCache()
        } else if (this.listType === 'wrong') {
          // 使用带缓存的错误单词函数
          wordData = await getCurrentBookWrongWordsWithCache()
        } else {
          // 使用带缓存的函数加载所有单词，提升性能
          wordData = await getCurrentBookWordsWithCache()
        }
        
        // 确保数据完整性
        this.words = wordData.filter(word => word && word.id && word.word)
        
        uni.hideLoading()
      } catch (error) {
        console.error('加载单词列表失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      }
    },
    
    onSearchInput() {
      // 搜索时重置字母索引
      this.currentLetter = ''
    },
    
    scrollToLetter(letter) {
      if (this.letterGroups[letter] && this.letterGroups[letter].length > 0) {
        this.currentLetter = letter
        this.scrollIntoView = `letter-${letter}`
      }
    },
    
    getStatusClass(word) {
      // 根据单词状态返回样式类
      if (this.listType === 'learned') return 'learned'
      if (this.listType === 'wrong') return 'wrong'
      return ''
    },
    
    getStatusText(word) {
      if (this.listType === 'learned') return '已学会'
      if (this.listType === 'wrong') return '需复习'
      return ''
    },
    
    goToWordDetail(word) {
      uni.navigateTo({
        url: `/pages/wordDetail/wordDetail?wordId=${word.id}&fromPage=wordList&queryMode=true`
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
  color: white;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.count {
  font-size: 28rpx;
  opacity: 0.8;
}

.search-section {
  margin-bottom: 30rpx;
}

.search-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.search-input {
  flex: 1;
  font-size: 32rpx;
  color: white;
  background: none;
  border: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

.alphabet-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10rpx;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  backdrop-filter: blur(5px);
}

.alphabet-item {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.alphabet-item.has-words {
  color: white;
  background: rgba(255, 255, 255, 0.3);
}

.alphabet-item.active {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  transform: scale(1.1);
}

.word-list {
  height: 600rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
}

.letter-section {
  margin-bottom: 20rpx;
}

.letter-header {
  background: #f5f5f5;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.words-group {
  background: white;
}

.word-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.word-item:active {
  background-color: #f8f9fa;
}

.word-left {
  flex: 1;
  margin-right: 20rpx;
}

.italian-word {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.word-meta {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.pos-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.word-id {
  font-size: 22rpx;
  color: #999;
}

.word-right {
  text-align: right;
  min-width: 200rpx;
}

.chinese-meaning {
  font-size: 28rpx;
  color: #555;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.word-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.learned {
  background: #4CAF50;
}

.status-dot.wrong {
  background: #f44336;
}

.status-text {
  font-size: 22rpx;
  color: #666;
}
</style> 