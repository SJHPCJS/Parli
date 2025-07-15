<template>
  <view class="container">
    <!-- 数据加载状态 -->
    <view v-if="!dataLoaded" class="loading-container">
      <view class="loading-icon">📚</view>
      <view class="loading-text">正在加载词汇数据...</view>
      <view class="loading-detail">当前词汇数量：{{ totalWords }}</view>
    </view>
    
    <!-- 学习界面 -->
    <view v-else>
      <!-- 进度条 -->
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
      </view>
      <view class="progress-text">第{{currentIndex + 1}}题 / 共{{totalQuestions}}题</view>
    
    <!-- Step 1: 选择题 -->
    <view v-if="step === 1 && current && current.word" class="step-container">
      <view class="title">请选择该单词的词性和意思</view>
      <view class="word-display">{{ current.word }}</view>
      <view class="options-container">
        <view 
          v-for="(option, index) in options" 
          :key="index" 
          class="option"
          :class="{ 'selected': selectedOption === index, 'correct': showResult && option && option.id === current.id, 'wrong': showResult && selectedOption === index && option && option.id !== current.id }"
          @click="selectOption(index, option)"
        >
          <view class="option-text" v-if="option && option.pos && option.meaning">
            <text class="pos-tag">{{ posMap[option.pos] || option.pos }}</text>
            <text class="meaning">{{ option.meaning }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="showResult" class="result-container">
        <view class="result-text" :class="{ 'correct': step1Result, 'wrong': !step1Result }">
          {{ step1Result ? '正确！继续下一步' : '错误！请重新选择' }}
        </view>
        <button v-if="step1Result" class="next-btn" @click="goToStep2">下一步：拼写练习</button>
      </view>
    </view>

    <!-- Step 2: 拼写练习 -->
    <view v-if="step === 2 && current && current.word" class="step-container">
      <view class="spelling-header">
        <view class="step-title">✍️ 拼写练习</view>
        <view class="hint-card">
          <view class="word-clue">
            <view class="pos-badge">{{ posMap[current.pos] || current.pos }}</view>
            <view class="meaning-hint">{{ current.meaning }}</view>
          </view>
        </view>
      </view>
      
      <view class="spelling-input-section">
        <view class="input-label">请输入意大利语单词：</view>
        <view class="input-wrapper">
          <input 
            v-model="userInput" 
            placeholder="输入单词..." 
            class="spelling-input"
            :class="{ 'input-correct': showSpellingResult && spellingResult, 'input-wrong': showSpellingResult && !spellingResult }"
            @input="clearSpellingResult"
            @confirm="checkSpelling"
            confirm-type="done"
            focus
          />
          <button class="check-button" @click="checkSpelling" :disabled="!userInput.trim()">
            <text class="check-icon">✓</text>
            <text>检查</text>
          </button>
        </view>
      </view>
      
      <view v-if="showSpellingResult" class="spelling-result">
        <view class="result-card" :class="{ 'success': spellingResult, 'error': !spellingResult }">
          <view class="result-icon">{{ spellingResult ? '🎉' : '❌' }}</view>
          <view class="result-text">
            <view class="result-title">{{ spellingResult ? '拼写正确！' : '拼写错误' }}</view>
            <view v-if="!spellingResult" class="correct-answer">
              正确答案：<text class="answer-word">{{ current.word }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 词汇详情显示 -->
    <view v-if="showWordDetail && currentWordDetail" class="word-detail-section">
      <view class="detail-header">
        <view class="detail-title">📖 词汇详解</view>
        <view class="congratulations">恭喜！已掌握这个单词</view>
      </view>
      
      <view class="detail-card">
        <!-- 主要信息 -->
        <view class="word-main-info">
          <view class="word-display">{{ currentWordDetail.word }}</view>
          <view class="word-meta">
            <view class="pos-tag">{{ posMap[currentWordDetail.pos] || currentWordDetail.pos }}</view>
            <view class="word-id">ID: {{ currentWordDetail.id }}</view>
          </view>
        </view>
        
        <!-- 释义列表 -->
        <view class="meanings-section">
          <view class="section-title">📝 释义</view>
          <view class="meanings-list">
            <view v-for="(meaning, index) in currentWordDetail.meanings" :key="index" class="meaning-item">
              <view class="meaning-number">{{ index + 1 }}</view>
              <view class="meaning-text">{{ meaning }}</view>
            </view>
          </view>
        </view>
        
        <!-- 例句 -->
        <view v-if="currentWordDetail.examples && currentWordDetail.examples.length > 0" class="examples-section">
          <view class="section-title">💡 例句</view>
          <view class="examples-list">
            <view v-for="(example, index) in currentWordDetail.examples" :key="index" class="example-item">
              {{ example }}
            </view>
          </view>
        </view>
        
        <!-- 完整内容 -->
        <view v-if="currentWordDetail.fullContent" class="full-content-section">
          <view class="section-title">📚 完整释义</view>
          <view class="full-content-text">{{ currentWordDetail.fullContent }}</view>
        </view>
      </view>
      
      <view class="detail-actions">
        <button class="next-word-btn" @click="nextQuestion">
          <text class="btn-icon">→</text>
          <text>下一个单词</text>
        </button>
      </view>
    </view>

    <!-- 完成提示 -->
    <view v-if="isCompleted" class="completion-container">
      <view class="completion-icon">🎉</view>
      <view class="completion-title">学习完成！</view>
      <view class="completion-stats">
        <view class="stat-item">
          <text class="stat-label">总题数：</text>
          <text class="stat-value">{{ totalQuestions }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">正确率：</text>
          <text class="stat-value">{{ totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0 }}%</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">错题数：</text>
          <text class="stat-value">{{ wrongAnswers }}</text>
        </view>
      </view>
      <button class="restart-btn" @click="restartLearning">再来一轮</button>
      <button class="home-btn" @click="goHome">回到首页</button>
    </view>
    </view> <!-- 学习界面 v-else 结束 -->
  </view>
</template>

<script>
import { 
  getCurrentBookWords, 
  getCurrentBookWordsAsync,
  addWrongWordToCurrentBook, 
  removeWrongWordFromCurrentBook, 
  addLearnedWordToCurrentBook, 
  getCurrentBook,
  getFullWordDetail
} from '@/utils/bookData.js'
import { posMap } from '@/utils/wordData.js'

export default {
  data() {
    return {
      step: 1,
      current: {},
      options: [],
      selectedOption: -1,
      showResult: false,
      step1Result: false,
      userInput: '',
      showSpellingResult: false,
      spellingResult: false,
      showWordDetail: false,
      currentIndex: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      wrongAnswers: 0,
      isCompleted: false,
      questionWords: [],
      posMap: posMap || {},
      currentBook: {},
      dataLoaded: false,
      totalWords: 0,
      currentWordDetail: null // 新增：用于存储词汇详情
    }
  },
  computed: {
    progressWidth() {
      return (this.currentIndex / this.totalQuestions) * 100
    }
  },
  onLoad() {
    try {
      this.currentBook = getCurrentBook()
      this.initLearning()
    } catch (error) {
      console.error('页面加载失败:', error)
      this.dataLoaded = true
      uni.showToast({
        title: '页面加载失败',
        icon: 'error'
      })
    }
  },

  methods: {
    async initLearning() {
      try {
        // 显示加载提示
        uni.showLoading({
          title: '加载词典数据...'
        })
        
        // 重置状态
        this.questionWords = []
        this.currentIndex = 0
        this.correctAnswers = 0
        this.wrongAnswers = 0
        this.isCompleted = false
        this.current = {}
        this.options = []
        this.currentWordDetail = null // 重置词汇详情
        
        // 从当前书籍中随机选择单词进行学习
        const availableWords = await getCurrentBookWordsAsync()
        
        uni.hideLoading()
        
        if (!availableWords || availableWords.length === 0) {
          this.dataLoaded = true
          uni.showModal({
            title: '提示',
            content: '当前书籍没有单词可供学习，请先选择其他书籍。',
            success: () => {
              uni.switchTab({
                url: '/pages/books/books'
              })
            }
          })
          return
        }
        
        // 确保有足够的词汇
        const questionCount = Math.min(this.totalQuestions, availableWords.length)
        const wordsCopy = [...availableWords].filter(word => word && word.id && word.word)
        
        if (wordsCopy.length === 0) {
          this.dataLoaded = true
          uni.showToast({
            title: '词汇数据异常',
            icon: 'error'
          })
          return
        }
        
        // 随机选择单词
        for (let i = 0; i < questionCount && wordsCopy.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * wordsCopy.length)
          this.questionWords.push(wordsCopy[randomIndex])
          wordsCopy.splice(randomIndex, 1)
        }
        
        this.totalQuestions = this.questionWords.length
        this.totalWords = availableWords.length
        this.dataLoaded = true
        
        if (this.questionWords.length > 0) {
          this.loadQuestion()
        } else {
          this.isCompleted = true
        }
      } catch (error) {
        uni.hideLoading()
        this.dataLoaded = true
        console.error('初始化学习数据失败:', error)
        uni.showModal({
          title: '错误',
          content: '加载词典数据失败，请重试',
          success: () => {
            uni.navigateBack()
          }
        })
      }
    },
    
    async loadQuestion() {
      if (this.currentIndex >= this.totalQuestions) {
        this.isCompleted = true
        return
      }
      
      // 确保questionWords数组有效且当前索引有效
      if (!this.questionWords || this.questionWords.length === 0 || !this.questionWords[this.currentIndex]) {
        console.error('questionWords数据异常:', this.questionWords)
        this.isCompleted = true
        return
      }
      
      this.current = this.questionWords[this.currentIndex] || {}
      await this.generateOptions()
      this.resetState()
    },
    
    async generateOptions() {
      try {
        // 确保current对象有效
        if (!this.current || !this.current.id) {
          console.error('current对象无效:', this.current)
          this.options = []
          return
        }
        
        // 从当前书籍中生成干扰项
        const currentBookWords = await getCurrentBookWordsAsync()
        
        if (!currentBookWords || currentBookWords.length === 0) {
          console.error('无法获取词汇数据')
          this.options = [this.current]
          return
        }
        
        const wrongOptions = currentBookWords
          .filter(w => w && w.id && w.id !== this.current.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 2)
        
        this.options = [this.current, ...wrongOptions]
          .filter(option => option && option.id) // 过滤掉无效选项
          .sort(() => 0.5 - Math.random())
          
        // 确保至少有一个选项
        if (this.options.length === 0) {
          this.options = [this.current]
        }
      } catch (error) {
        console.error('生成选项失败:', error)
        // 如果获取失败，只显示当前单词
        this.options = this.current ? [this.current] : []
      }
    },
    
    resetState() {
      this.step = 1
      this.selectedOption = -1
      this.showResult = false
      this.step1Result = false
      this.userInput = ''
      this.showSpellingResult = false
      this.spellingResult = false
      this.showWordDetail = false
    },
    
    selectOption(index, option) {
      if (this.showResult || !option) return
      
      this.selectedOption = index
      this.step1Result = option && option.id === this.current.id
      this.showResult = true
      
      // 如果选择错误，记录错题，并在2秒后允许重新选择
      if (!this.step1Result) {
        setTimeout(() => {
          this.showResult = false
          this.selectedOption = -1
        }, 2000)
      }
    },
    
    goToStep2() {
      this.step = 2
      this.showResult = false
    },
    
    checkSpelling() {
      if (!this.userInput.trim() || !this.current || !this.current.word) {
        return
      }
      
      const userAnswer = this.userInput.trim().toLowerCase()
      const correctAnswer = this.current.word.toLowerCase()
      
      this.spellingResult = userAnswer === correctAnswer
      this.showSpellingResult = true
      
      if (this.spellingResult) {
        this.correctAnswers++
        // 如果两步都正确，从错题中移除
        if (this.step1Result && this.current && this.current.id) {
          removeWrongWordFromCurrentBook(this.current.id)
          addLearnedWordToCurrentBook(this.current.id)
        }
        
        // 获取完整词汇详情
        const fullDetail = getFullWordDetail(this.current.id)
        if (fullDetail) {
          this.currentWordDetail = fullDetail
        } else {
          // 如果无法获取完整详情，使用当前数据作为备选
          this.currentWordDetail = {
            ...this.current,
            meanings: this.current.meanings || [this.current.meaning],
            examples: this.current.examples || [],
            fullContent: this.current.fullContent || ''
          }
        }
        
        // 拼写正确后延迟显示单词详情
        setTimeout(() => {
          this.showWordDetail = true
        }, 1500)
      } else {
        this.wrongAnswers++
        if (this.current && this.current.id) {
          addWrongWordToCurrentBook(this.current.id)
        }
      }
    },
    
    clearSpellingResult() {
      this.showSpellingResult = false
    },
    
    async nextQuestion() {
      // 重置状态
      this.showWordDetail = false
      this.currentWordDetail = null
      this.showSpellingResult = false
      this.userInput = ''
      
      this.currentIndex++
      await this.loadQuestion()
    },
    
    restartLearning() {
      this.dataLoaded = false // 重新开始时显示加载状态
      this.initLearning()
    },
    
    goHome() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 28rpx;
  margin-bottom: 40rpx;
  opacity: 0.9;
}

.step-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  backdrop-filter: blur(10px);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}

.word-display {
  font-size: 64rpx;
  font-weight: bold;
  text-align: center;
  margin: 60rpx 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.options-container {
  margin-bottom: 40rpx;
}

.option {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.option.selected {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.option.correct {
  background: rgba(76, 175, 80, 0.3);
  border-color: #4CAF50;
}

.option.wrong {
  background: rgba(244, 67, 54, 0.3);
  border-color: #f44336;
}

.option-text {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.pos-tag {
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.meaning {
  font-size: 32rpx;
}

.clue-container {
  text-align: center;
  margin: 40rpx 0;
}

.clue {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  font-size: 36rpx;
}

.input-container {
  margin: 40rpx 0;
}

.input {
  width: 100%;
  padding: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.input.correct {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.input.wrong {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.submit-btn, .next-btn, .restart-btn, .home-btn {
  width: 100%;
  padding: 30rpx;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  border: none;
}

.submit-btn {
  background: #4CAF50;
  color: white;
}

.next-btn {
  background: #2196F3;
  color: white;
}

.restart-btn {
  background: #FF9800;
  color: white;
}

.home-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.result-container {
  text-align: center;
  margin-top: 40rpx;
}

.result-text {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.result-text.correct {
  color: #4CAF50;
}

.result-text.wrong {
  color: #f44336;
}

.completion-container {
  text-align: center;
  padding: 60rpx 40rpx;
}

.completion-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.completion-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 60rpx;
}

.completion-stats {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 60rpx;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 32rpx;
}

.stat-label {
  opacity: 0.8;
}

.stat-value {
  font-weight: bold;
  color: #4CAF50;
}

/* 单词详情样式 */
.word-detail-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-top: 40rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.detail-header {
  text-align: center;
  margin-bottom: 40rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.word-display-large {
  font-size: 64rpx;
  font-weight: bold;
  text-align: center;
  color: #667eea;
  margin-bottom: 40rpx;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-item {
  margin-bottom: 30rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.detail-value {
  font-size: 32rpx;
  color: #333;
}

.detail-value.pos-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  display: inline-block;
  font-size: 24rpx;
}

.detail-value.meaning-text {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  line-height: 1.6;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.status-badge.learned {
  background: #e8f5e8;
  color: #4CAF50;
}

.detail-actions {
  text-align: center;
  margin-top: 40rpx;
}

.continue-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 32rpx;
  font-weight: bold;
  width: 300rpx;
}

/* 新增样式 */
.spelling-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.step-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.hint-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15rpx;
  padding: 20rpx;
  backdrop-filter: blur(5px);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.word-clue {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 28rpx;
  color: #fff;
}

.pos-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.meaning-hint {
  font-size: 28rpx;
  opacity: 0.9;
}

.spelling-input-section {
  margin-top: 40rpx;
}

.input-label {
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 20rpx;
  opacity: 0.9;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  padding: 15rpx 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.spelling-input {
  flex: 1;
  padding: 10rpx 0;
  font-size: 32rpx;
  color: white;
  background: none;
  border: none;
  outline: none;
}

.spelling-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.check-button {
  background: #4CAF50;
  color: white;
  padding: 15rpx 25rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  gap: 10rpx;
  transition: background-color 0.3s ease;
}

.check-button:disabled {
  background-color: rgba(76, 175, 80, 0.5);
  color: rgba(255, 255, 255, 0.7);
}

.check-button:not(:disabled):active {
  background-color: #388e3c;
}

.check-icon {
  font-size: 32rpx;
}

.spelling-result {
  margin-top: 40rpx;
  text-align: center;
}

.result-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.result-card.success {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
}

.result-card.error {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.2);
}

.result-icon {
  font-size: 60rpx;
}

.result-text {
  flex: 1;
  text-align: left;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #fff;
}

.correct-answer {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.answer-word {
  font-weight: bold;
  color: #fff;
}

.word-detail-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-top: 40rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  color: #333;
}

.congratulations {
  font-size: 36rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

.detail-card {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.word-main-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.word-display {
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.word-meta {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  font-size: 28rpx;
  color: #555;
}

.pos-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.word-id {
  font-size: 24rpx;
  color: #666;
}

.meanings-section {
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #eee;
}

.meanings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.meaning-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-bottom: 15rpx;
  font-size: 28rpx;
  color: #555;
}

.meaning-number {
  font-size: 24rpx;
  font-weight: bold;
  color: #667eea;
  background: #e3f2fd;
  padding: 8rpx 12rpx;
  border-radius: 10rpx;
}

.meaning-text {
  flex: 1;
  line-height: 1.6;
}

.examples-section {
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.examples-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.example-item {
  font-size: 28rpx;
  color: #555;
  margin-bottom: 15rpx;
  padding-left: 20rpx;
  position: relative;
}

.example-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
}

.full-content-section {
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.full-content-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #444;
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #eee;
}

.detail-actions {
  text-align: center;
  margin-top: 40rpx;
}

.next-word-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 32rpx;
  font-weight: bold;
  width: 300rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.btn-icon {
  font-size: 32rpx;
}
</style>
