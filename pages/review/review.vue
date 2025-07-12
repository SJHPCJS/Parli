<template>
  <view class="container">
    <!-- 没有错题时的提示 -->
    <view v-if="!hasWrongWords" class="no-words-container">
      <view class="no-words-icon">📚</view>
      <view class="no-words-title">暂无错题需要复习</view>
      <view class="no-words-desc">继续学习积累更多词汇吧！</view>
      <button class="go-learn-btn" @click="goToLearn">开始学习</button>
    </view>

    <!-- 有错题时的复习界面 -->
    <view v-else>
      <!-- 进度条 -->
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
      </view>
      <view class="progress-text">复习进度：{{currentIndex + 1}} / {{totalQuestions}}</view>
      
      <!-- Step 1: 选择题 -->
      <view v-if="step === 1" class="step-container">
        <view class="title">复习：选择该单词的词性和意思</view>
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
        <view class="title">复习：请拼写这个单词</view>
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
        <view class="completion-title">复习完成！</view>
        <view class="completion-stats">
          <view class="stat-item">
            <text class="stat-label">复习题数：</text>
            <text class="stat-value">{{ totalQuestions }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">掌握题数：</text>
            <text class="stat-value">{{ masteredWords }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">仍需复习：</text>
            <text class="stat-value">{{ remainingWords }}</text>
          </view>
        </view>
        <button class="restart-btn" @click="restartReview">再次复习</button>
        <button class="home-btn" @click="goHome">回到首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getCurrentBookWords, 
  posMap, 
  getCurrentBookWrongWords, 
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
      totalQuestions: 0,
      masteredWords: 0,
      remainingWords: 0,
      isCompleted: false,
      wrongWords: [],
      hasWrongWords: false,
      posMap,
      currentBook: {}
    }
  },
  computed: {
    progressWidth() {
      return this.totalQuestions > 0 ? (this.currentIndex / this.totalQuestions) * 100 : 0
    }
  },
  onLoad() {
    this.currentBook = getCurrentBook()
    this.initReview()
  },
  onShow() {
    // 每次显示页面时重新检查错题
    this.initReview()
  },
  methods: {
    initReview() {
      this.wrongWords = getCurrentBookWrongWords()
      this.hasWrongWords = this.wrongWords.length > 0
      
      if (this.hasWrongWords) {
        this.totalQuestions = this.wrongWords.length
        this.currentIndex = 0
        this.masteredWords = 0
        this.remainingWords = 0
        this.isCompleted = false
        this.loadQuestion()
      }
    },
    
    loadQuestion() {
      if (this.currentIndex >= this.totalQuestions) {
        this.isCompleted = true
        return
      }
      
      this.current = this.wrongWords[this.currentIndex]
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
      
      // 如果选择错误，2秒后自动重置允许重新选择
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
      
      if (this.spellingResult && this.step1Result) {
        // 两步都正确，从错题中移除，标记为已掌握
        removeWrongWordFromCurrentBook(this.current.id)
        addLearnedWordToCurrentBook(this.current.id)
        this.masteredWords++
      } else {
        // 仍有错误，保持在错题中
        this.remainingWords++
      }
    },
    
    clearSpellingResult() {
      this.showSpellingResult = false
    },
    
    nextQuestion() {
      this.currentIndex++
      this.loadQuestion()
    },
    
    restartReview() {
      this.initReview()
    },
    
    goHome() {
      uni.navigateBack()
    },
    
    goToLearn() {
      uni.redirectTo({
        url: '/pages/learn/learn'
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
}

.no-words-container {
  text-align: center;
  padding: 100rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
}

.no-words-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.no-words-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.no-words-desc {
  font-size: 32rpx;
  opacity: 0.8;
  margin-bottom: 60rpx;
}

.go-learn-btn {
  width: 300rpx;
  height: 80rpx;
  background: #4CAF50;
  color: white;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
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
  background-color: #00b894;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
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
  color: #00b894;
}
</style> 