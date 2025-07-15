<template>
  <view class="container">
    <!-- 开始测试界面 -->
    <view v-if="!isQuizStarted" class="start-screen">
      <view class="quiz-header">
        <view class="quiz-title">随机抽查</view>
        <view class="quiz-subtitle">检验你的学习成果</view>
      </view>
      
      <view class="quiz-info">
        <view class="info-item">
          <view class="info-icon">📚</view>
          <view class="info-text">当前书籍：《{{ currentBook.title }}》</view>
        </view>
        <view class="info-item">
          <view class="info-icon">🎯</view>
          <view class="info-text">测试数量：{{ quizWords.length }}个单词</view>
        </view>
        <view class="info-item">
          <view class="info-icon">⏰</view>
          <view class="info-text">测试模式：选择 + 拼写</view>
        </view>
      </view>
      
      <view class="start-actions">
        <button class="start-btn" @click="startQuiz" :disabled="quizWords.length === 0">
          {{ quizWords.length === 0 ? '暂无可测试单词' : '开始测试' }}
        </button>
        <button class="back-btn" @click="goBack">返回首页</button>
      </view>
    </view>

    <!-- 测试进行中 -->
    <view v-if="isQuizStarted && !isQuizCompleted" class="quiz-screen">
      <!-- 进度条 -->
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
      </view>
      <view class="progress-text">第{{currentIndex + 1}}题 / 共{{quizWords.length}}题</view>
      
      <!-- Step 1: 选择题 -->
      <view v-if="step === 1" class="step-container">
        <view class="title">选择正确的词性和意思</view>
        <view class="word-display">{{ current.word }}</view>
        <view class="options-container">
          <view 
            v-for="(option, index) in options" 
            :key="index" 
            class="option"
            :class="{ 'selected': selectedOption === index, 'correct': showResult && option.id === current.id, 'wrong': showResult && selectedOption === index && option.id !== current.id }"
            @click="selectOption(index, option)"
          >
            <view class="option-text">
              <text class="pos-tag">{{ posMap[option.pos] }}</text>
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
      <view v-if="step === 2" class="step-container">
        <view class="title">请拼写这个单词</view>
        <view class="clue-container">
          <view class="clue">
            <text class="pos-tag">{{ posMap[current.pos] }}</text>
            <text class="meaning">{{ current.meaning }}</text>
          </view>
        </view>
        
        <view class="input-container">
          <input 
            v-model="userInput" 
            placeholder="请输入意大利语单词" 
            class="input"
            :class="{ 'correct': showSpellingResult && spellingResult, 'wrong': showSpellingResult && !spellingResult }"
            @input="clearSpellingResult"
          />
          <button class="submit-btn" @click="checkSpelling" :disabled="!userInput.trim()">提交</button>
        </view>
        
        <view v-if="showSpellingResult" class="result-container">
          <view class="result-text" :class="{ 'correct': spellingResult, 'wrong': !spellingResult }">
            {{ spellingResult ? '正确！' : `错误！正确答案是：${current.word}` }}
          </view>
          <button class="next-btn" @click="nextQuestion">{{ isLastQuestion ? '完成测试' : '下一题' }}</button>
        </view>
      </view>
    </view>

    <!-- 测试结果 -->
    <view v-if="isQuizCompleted" class="result-screen">
      <view class="result-header">
        <view class="result-icon">{{ getResultIcon() }}</view>
        <view class="result-title">测试完成！</view>
        <view class="result-subtitle">{{ getResultComment() }}</view>
      </view>
      
      <view class="result-stats">
        <view class="stat-card">
          <view class="stat-number">{{ quizWords.length }}</view>
          <view class="stat-label">测试题数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number">{{ correctCount }}</view>
          <view class="stat-label">正确题数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number">{{ Math.round(accuracy) }}%</view>
          <view class="stat-label">正确率</view>
        </view>
      </view>
      
      <view class="result-details">
        <view class="details-title">详细结果</view>
        <view class="details-list">
          <view 
            v-for="(result, index) in quizResults" 
            :key="index"
            class="detail-item"
            :class="{ 'correct': result.correct, 'wrong': !result.correct }"
          >
            <view class="detail-word">{{ result.word }}</view>
            <view class="detail-meaning">{{ result.meaning }}</view>
            <view class="detail-status">{{ result.correct ? '✓' : '✗' }}</view>
          </view>
        </view>
      </view>
      
      <view class="result-actions">
        <button class="retry-btn" @click="retryQuiz">再测一次</button>
        <button class="home-btn" @click="goBack">返回首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getCurrentBook, 
  getCurrentBookWords, 
  getRandomWordsForQuiz
} from '@/utils/bookData.js'
import { posMap } from '@/utils/wordData.js'

export default {
  data() {
    return {
      currentBook: {},
      quizWords: [],
      isQuizStarted: false,
      isQuizCompleted: false,
      currentIndex: 0,
      step: 1,
      current: {},
      options: [],
      selectedOption: -1,
      showResult: false,
      step1Result: false,
      userInput: '',
      showSpellingResult: false,
      spellingResult: false,
      quizResults: [],
      correctCount: 0,
      posMap
    }
  },
  computed: {
    progressWidth() {
      return this.quizWords.length > 0 ? (this.currentIndex / this.quizWords.length) * 100 : 0
    },
    accuracy() {
      return this.quizWords.length > 0 ? (this.correctCount / this.quizWords.length) * 100 : 0
    },
    isLastQuestion() {
      return this.currentIndex === this.quizWords.length - 1
    }
  },
  onLoad() {
    this.initQuiz()
  },
  methods: {
    initQuiz() {
      this.currentBook = getCurrentBook()
      this.quizWords = getRandomWordsForQuiz(10)
      this.isQuizStarted = false
      this.isQuizCompleted = false
      this.currentIndex = 0
      this.quizResults = []
      this.correctCount = 0
    },
    
    startQuiz() {
      if (this.quizWords.length === 0) return
      
      this.isQuizStarted = true
      this.loadQuestion()
    },
    
    loadQuestion() {
      if (this.currentIndex >= this.quizWords.length) {
        this.completeQuiz()
        return
      }
      
      this.current = this.quizWords[this.currentIndex]
      this.generateOptions()
      this.resetState()
    },
    
    generateOptions() {
      const currentBookWords = getCurrentBookWords()
      const wrongOptions = currentBookWords
        .filter(w => w.id !== this.current.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
      
      this.options = [this.current, ...wrongOptions]
        .sort(() => 0.5 - Math.random())
    },
    
    resetState() {
      this.step = 1
      this.selectedOption = -1
      this.showResult = false
      this.step1Result = false
      this.userInput = ''
      this.showSpellingResult = false
      this.spellingResult = false
    },
    
    selectOption(index, option) {
      if (this.showResult) return
      
      this.selectedOption = index
      this.step1Result = option.id === this.current.id
      this.showResult = true
      
      // 如果选择错误，2秒后自动重置
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
      if (!this.userInput.trim()) return
      
      this.spellingResult = this.userInput.trim().toLowerCase() === this.current.word.toLowerCase()
      this.showSpellingResult = true
      
      // 记录结果
      const isCorrect = this.step1Result && this.spellingResult
      if (isCorrect) {
        this.correctCount++
      }
      
      this.quizResults.push({
        word: this.current.word,
        meaning: this.current.meaning,
        correct: isCorrect,
        step1Correct: this.step1Result,
        step2Correct: this.spellingResult
      })
    },
    
    clearSpellingResult() {
      this.showSpellingResult = false
    },
    
    nextQuestion() {
      this.currentIndex++
      this.loadQuestion()
    },
    
    completeQuiz() {
      this.isQuizCompleted = true
      this.isQuizStarted = false
    },
    
    retryQuiz() {
      this.initQuiz()
    },
    
    goBack() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    
    getResultIcon() {
      if (this.accuracy >= 90) return '🎉'
      if (this.accuracy >= 70) return '👍'
      if (this.accuracy >= 50) return '😊'
      return '💪'
    },
    
    getResultComment() {
      if (this.accuracy >= 90) return '优秀！掌握得很好！'
      if (this.accuracy >= 70) return '不错！继续加油！'
      if (this.accuracy >= 50) return '还可以，需要多练习'
      return '需要加强学习哦'
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 40rpx;
  color: white;
}

.start-screen {
  text-align: center;
  padding: 60rpx 0;
}

.quiz-header {
  margin-bottom: 80rpx;
}

.quiz-title {
  font-size: 64rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.quiz-subtitle {
  font-size: 32rpx;
  opacity: 0.9;
}

.quiz-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 60rpx;
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.info-text {
  font-size: 28rpx;
  flex: 1;
}

.start-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.start-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 30rpx;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 30rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
}

.quiz-screen {
  /* 沿用学习页面的样式 */
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

.submit-btn, .next-btn {
  width: 100%;
  padding: 30rpx;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  border: none;
  background: #4CAF50;
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

.result-screen {
  text-align: center;
  padding: 60rpx 0;
}

.result-header {
  margin-bottom: 60rpx;
}

.result-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.result-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.result-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 60rpx;
  gap: 20rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  flex: 1;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.result-details {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 60rpx;
  backdrop-filter: blur(10px);
}

.details-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
}

.detail-item.correct {
  background: rgba(76, 175, 80, 0.2);
}

.detail-item.wrong {
  background: rgba(244, 67, 54, 0.2);
}

.detail-word {
  font-size: 28rpx;
  font-weight: bold;
  flex: 1;
}

.detail-meaning {
  font-size: 24rpx;
  opacity: 0.8;
  flex: 1;
}

.detail-status {
  font-size: 24rpx;
  font-weight: bold;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.retry-btn {
  background: #FF9800;
  color: white;
  border: none;
  padding: 30rpx;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.home-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 30rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
}
</style> 