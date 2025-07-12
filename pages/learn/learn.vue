<template>
  <view class="container">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
    </view>
    <view class="progress-text">第{{currentIndex + 1}}题 / 共{{totalQuestions}}题</view>
    
    <!-- Step 1: 选择题 -->
    <view v-if="step === 1" class="step-container">
      <view class="title">请选择该单词的词性和意思</view>
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
        <button class="next-btn" @click="nextQuestion">下一题</button>
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
          <text class="stat-value">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">错题数：</text>
          <text class="stat-value">{{ wrongAnswers }}</text>
        </view>
      </view>
      <button class="restart-btn" @click="restartLearning">再来一轮</button>
      <button class="home-btn" @click="goHome">回到首页</button>
    </view>
  </view>
</template>

<script>
import { 
  getCurrentBookWords, 
  posMap, 
  addWrongWordToCurrentBook, 
  removeWrongWordFromCurrentBook, 
  addLearnedWordToCurrentBook, 
  getCurrentBook
} from '@/utils/bookData.js'

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
      currentIndex: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      wrongAnswers: 0,
      isCompleted: false,
      questionWords: [],
      posMap,
      currentBook: {}
    }
  },
  computed: {
    progressWidth() {
      return (this.currentIndex / this.totalQuestions) * 100
    }
  },
  onLoad() {
    this.currentBook = getCurrentBook()
    this.initLearning()
  },
  methods: {
    initLearning() {
      // 从当前书籍中随机选择10个单词进行学习
      this.questionWords = []
      const availableWords = [...getCurrentBookWords()]
      
      if (availableWords.length === 0) {
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
      
      const questionCount = Math.min(this.totalQuestions, availableWords.length)
      
      for (let i = 0; i < questionCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableWords.length)
        this.questionWords.push(availableWords[randomIndex])
        availableWords.splice(randomIndex, 1)
      }
      
      this.totalQuestions = questionCount
      this.currentIndex = 0
      this.correctAnswers = 0
      this.wrongAnswers = 0
      this.isCompleted = false
      this.loadQuestion()
    },
    
    loadQuestion() {
      if (this.currentIndex >= this.totalQuestions) {
        this.isCompleted = true
        return
      }
      
      this.current = this.questionWords[this.currentIndex]
      this.generateOptions()
      this.resetState()
    },
    
    generateOptions() {
      // 从当前书籍中生成干扰项
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
      
      // 如果选择错误，记录错题，并在2秒后允许重新选择
      if (!this.step1Result) {
        addWrongWordToCurrentBook(this.current.id)
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
      
      if (this.spellingResult) {
        this.correctAnswers++
        // 如果两步都正确，从错题中移除
        if (this.step1Result) {
          removeWrongWordFromCurrentBook(this.current.id)
          addLearnedWordToCurrentBook(this.current.id)
        }
      } else {
        this.wrongAnswers++
        addWrongWordToCurrentBook(this.current.id)
      }
    },
    
    clearSpellingResult() {
      this.showSpellingResult = false
    },
    
    nextQuestion() {
      this.currentIndex++
      this.loadQuestion()
    },
    
    restartLearning() {
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
</style>
