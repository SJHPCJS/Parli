<template>
  <view class="container">
    <view class="header">
      <view class="title">选择学习书籍</view>
      <view class="subtitle">{{ bookList ? bookList.length : 0 }}本书籍可供选择</view>
    </view>
    
    <view class="books-list">
      <view 
        v-for="book in bookList" 
        :key="book.id"
        class="book-card"
        :class="{ 'active': currentBook.id === book.id }"
        :style="{ background: `linear-gradient(135deg, ${book.color}99, ${book.color}dd)` }"
        @click="selectBook(book)"
      >
        <view class="book-cover">{{ book.cover }}</view>
        <view class="book-info">
          <view class="book-title">{{ book.title }}</view>
          <view class="book-subtitle">{{ book.subtitle }}</view>
          <view class="book-desc">{{ book.description }}</view>
          <view class="book-meta">
            <view class="difficulty">{{ book.difficulty }}</view>
            <view class="word-count">{{ book.wordCount }}词</view>
          </view>
        </view>
        <view class="book-progress">
          <view class="progress-info">
            <text>学习进度：{{ getBookProgressPercent(book.id) }}%</text>
            <text>错题：{{ getBookWrongCount(book.id) }}</text>
          </view>
          <view class="progress-bar">
            <view 
              class="progress-fill"
              :style="{ width: getBookProgressPercent(book.id) + '%' }"
            ></view>
          </view>
        </view>
        <view v-if="currentBook.id === book.id" class="selected-mark">
          <text>✓</text>
        </view>
      </view>
    </view>
    
    <!-- 快速切换区域 -->
    <view class="quick-actions">
      <view class="section-title">快速操作</view>
      <view class="actions-grid">
        <view class="action-item" @click="showAllProgress">
          <view class="action-icon">📊</view>
          <view class="action-text">总体进度</view>
        </view>
        <view class="action-item" @click="resetAllProgress">
          <view class="action-icon">🔄</view>
          <view class="action-text">重置所有</view>
        </view>
        <view class="action-item" @click="exportProgress">
          <view class="action-icon">📤</view>
          <view class="action-text">导出数据</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  bookList, 
  getCurrentBook, 
  setCurrentBook, 
  getBookProgress,
  saveBookProgress,
  getCurrentBookWords,
  getCurrentBookWrongWordsAsync
} from '@/utils/bookData.js'

export default {
  data() {
    return {
      bookList,
      currentBook: {},
      bookProgresses: {}, // 缓存书籍进度数据
      bookWrongCounts: {} // 缓存错题数据
    }
  },
  async onLoad() {
    this.currentBook = await getCurrentBook()
    this.loadBookStatistics()
  },
  async onShow() {
    this.currentBook = await getCurrentBook()
    this.loadBookStatistics()
  },
  
  onLoad() {
    // 监听学习完成事件
    uni.$on('learningComplete', () => {
      this.loadBookStatistics() // 重新加载书籍统计
    })
  },
  
  onUnload() {
    // 移除事件监听
    uni.$off('learningComplete')
  },
  methods: {
    selectBook(book) {
      if (this.currentBook.id === book.id) return
      
      // 切换书籍
      setCurrentBook(book.id)
      this.currentBook = book
      
      uni.showToast({
        title: `已切换到《${book.title}》`,
        icon: 'success'
      })
      
      // 延时切换到学习页面
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    },
    
    getBookProgressPercent(bookId) {
      const progress = this.bookProgresses[bookId]
      if (!progress) return 0
      return progress.percentage || 0
    },
    
    getBookWrongCount(bookId) {
      return this.bookWrongCounts[bookId] || 0
    },
    
         async loadBookStatistics() {
       try {
         // 为每本书异步加载统计数据
         for (const book of this.bookList) {
           const progress = await getBookProgress(book.id)
           
           // 由于系统只有一本书，直接获取当前书的错题数
           if (book.id === 1) { // 当前书的ID
             const wrongWords = await getCurrentBookWrongWordsAsync()
             this.$set(this.bookWrongCounts, book.id, wrongWords.length)
           } else {
             this.$set(this.bookWrongCounts, book.id, 0)
           }
           
           this.$set(this.bookProgresses, book.id, progress)
         }
       } catch (error) {
         console.error('加载书籍统计失败:', error)
       }
     },
    
    getBookWordsCount(bookId) {
      const book = bookList.find(b => b.id === bookId)
      return book ? book.wordCount : 0
    },
    
    showAllProgress() {
      let progressText = '📚 总体学习进度：\n\n'
      
      bookList.forEach(book => {
        const percent = this.getBookProgressPercent(book.id)
        const wrongCount = this.getBookWrongCount(book.id)
        progressText += `${book.title}\n进度：${percent}% | 错题：${wrongCount}个\n\n`
      })
      
      uni.showModal({
        title: '学习统计',
        content: progressText,
        showCancel: false
      })
    },
    
    resetAllProgress() {
      uni.showModal({
        title: '重置所有数据',
        content: '确定要重置所有书籍的学习进度吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            bookList.forEach(book => {
              const emptyProgress = {
                learnedWords: [],
                wrongWords: [],
                reviewWords: []
              }
              saveBookProgress(book.id, emptyProgress)
            })
            
            uni.showToast({
              title: '重置成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    exportProgress() {
      let exportData = {
        exportTime: new Date().toLocaleString(),
        books: {}
      }
      
      bookList.forEach(book => {
        const progress = getBookProgress(book.id)
        exportData.books[book.id] = {
          title: book.title,
          progress: progress,
          progressPercent: this.getBookProgressPercent(book.id)
        }
      })
      
      // 转换为JSON字符串
      const jsonStr = JSON.stringify(exportData, null, 2)
      
      uni.showModal({
        title: '导出数据',
        content: '学习数据已生成，请复制保存。',
        showCancel: false,
        success: () => {
          // 这里可以根据需要实现复制到剪贴板功能
          console.log('Export data:', jsonStr)
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  color: white;
}

.title {
  font-size: 56rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

.books-list {
  margin-bottom: 60rpx;
}

.book-card {
  margin-bottom: 30rpx;
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.book-card.active {
  border-color: #FFD700;
  box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.5);
  transform: scale(1.02);
}

.book-card:active {
  transform: scale(0.98);
}

.book-cover {
  font-size: 80rpx;
  text-align: center;
  padding: 40rpx 0 20rpx 0;
}

.book-info {
  padding: 0 40rpx 30rpx 40rpx;
  color: white;
}

.book-title {
  font-size: 42rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.book-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 20rpx;
}

.book-desc {
  font-size: 26rpx;
  opacity: 0.8;
  line-height: 1.5;
  margin-bottom: 30rpx;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.difficulty {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.word-count {
  font-size: 24rpx;
  opacity: 0.8;
}

.book-progress {
  padding: 20rpx 40rpx 30rpx 40rpx;
  background: rgba(0, 0, 0, 0.1);
  color: white;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  font-size: 24rpx;
}

.progress-bar {
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

.selected-mark {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  background: #FFD700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.quick-actions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 30rpx;
  text-align: center;
}

.actions-grid {
  display: flex;
  justify-content: space-around;
  gap: 20rpx;
}

.action-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.action-item:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 15rpx;
}

.action-text {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}
</style> 