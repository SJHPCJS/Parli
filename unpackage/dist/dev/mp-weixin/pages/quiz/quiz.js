"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const _sfc_main = {
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
      userInput: "",
      showSpellingResult: false,
      spellingResult: false,
      quizResults: [],
      correctCount: 0,
      posMap: utils_bookData.posMap
    };
  },
  computed: {
    progressWidth() {
      return this.quizWords.length > 0 ? this.currentIndex / this.quizWords.length * 100 : 0;
    },
    accuracy() {
      return this.quizWords.length > 0 ? this.correctCount / this.quizWords.length * 100 : 0;
    },
    isLastQuestion() {
      return this.currentIndex === this.quizWords.length - 1;
    }
  },
  onLoad() {
    this.initQuiz();
  },
  methods: {
    initQuiz() {
      this.currentBook = utils_bookData.getCurrentBook();
      this.quizWords = utils_bookData.getRandomWordsForQuiz(10);
      this.isQuizStarted = false;
      this.isQuizCompleted = false;
      this.currentIndex = 0;
      this.quizResults = [];
      this.correctCount = 0;
    },
    startQuiz() {
      if (this.quizWords.length === 0)
        return;
      this.isQuizStarted = true;
      this.loadQuestion();
    },
    loadQuestion() {
      if (this.currentIndex >= this.quizWords.length) {
        this.completeQuiz();
        return;
      }
      this.current = this.quizWords[this.currentIndex];
      this.generateOptions();
      this.resetState();
    },
    generateOptions() {
      const currentBookWords = utils_bookData.getCurrentBookWords();
      const wrongOptions = currentBookWords.filter((w) => w.id !== this.current.id).sort(() => 0.5 - Math.random()).slice(0, 2);
      this.options = [this.current, ...wrongOptions].sort(() => 0.5 - Math.random());
    },
    resetState() {
      this.step = 1;
      this.selectedOption = -1;
      this.showResult = false;
      this.step1Result = false;
      this.userInput = "";
      this.showSpellingResult = false;
      this.spellingResult = false;
    },
    selectOption(index, option) {
      if (this.showResult)
        return;
      this.selectedOption = index;
      this.step1Result = option.id === this.current.id;
      this.showResult = true;
      if (!this.step1Result) {
        setTimeout(() => {
          this.showResult = false;
          this.selectedOption = -1;
        }, 2e3);
      }
    },
    goToStep2() {
      this.step = 2;
      this.showResult = false;
    },
    checkSpelling() {
      if (!this.userInput.trim())
        return;
      this.spellingResult = this.userInput.trim().toLowerCase() === this.current.word.toLowerCase();
      this.showSpellingResult = true;
      const isCorrect = this.step1Result && this.spellingResult;
      if (isCorrect) {
        this.correctCount++;
      }
      this.quizResults.push({
        word: this.current.word,
        meaning: this.current.meaning,
        correct: isCorrect,
        step1Correct: this.step1Result,
        step2Correct: this.spellingResult
      });
    },
    clearSpellingResult() {
      this.showSpellingResult = false;
    },
    nextQuestion() {
      this.currentIndex++;
      this.loadQuestion();
    },
    completeQuiz() {
      this.isQuizCompleted = true;
      this.isQuizStarted = false;
    },
    retryQuiz() {
      this.initQuiz();
    },
    goBack() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    getResultIcon() {
      if (this.accuracy >= 90)
        return "🎉";
      if (this.accuracy >= 70)
        return "👍";
      if (this.accuracy >= 50)
        return "😊";
      return "💪";
    },
    getResultComment() {
      if (this.accuracy >= 90)
        return "优秀！掌握得很好！";
      if (this.accuracy >= 70)
        return "不错！继续加油！";
      if (this.accuracy >= 50)
        return "还可以，需要多练习";
      return "需要加强学习哦";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.isQuizStarted
  }, !$data.isQuizStarted ? {
    b: common_vendor.t($data.currentBook.title),
    c: common_vendor.t($data.quizWords.length),
    d: common_vendor.t($data.quizWords.length === 0 ? "暂无可测试单词" : "开始测试"),
    e: common_vendor.o((...args) => $options.startQuiz && $options.startQuiz(...args)),
    f: $data.quizWords.length === 0,
    g: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {}, {
    h: $data.isQuizStarted && !$data.isQuizCompleted
  }, $data.isQuizStarted && !$data.isQuizCompleted ? common_vendor.e({
    i: $options.progressWidth + "%",
    j: common_vendor.t($data.currentIndex + 1),
    k: common_vendor.t($data.quizWords.length),
    l: $data.step === 1
  }, $data.step === 1 ? common_vendor.e({
    m: common_vendor.t($data.current.word),
    n: common_vendor.f($data.options, (option, index, i0) => {
      return {
        a: common_vendor.t($data.posMap[option.pos]),
        b: common_vendor.t(option.meaning),
        c: index,
        d: $data.selectedOption === index ? 1 : "",
        e: $data.showResult && option.id === $data.current.id ? 1 : "",
        f: $data.showResult && $data.selectedOption === index && option.id !== $data.current.id ? 1 : "",
        g: common_vendor.o(($event) => $options.selectOption(index, option), index)
      };
    }),
    o: $data.showResult
  }, $data.showResult ? common_vendor.e({
    p: common_vendor.t($data.step1Result ? "正确！继续下一步" : "错误！请重新选择"),
    q: $data.step1Result ? 1 : "",
    r: !$data.step1Result ? 1 : "",
    s: $data.step1Result
  }, $data.step1Result ? {
    t: common_vendor.o((...args) => $options.goToStep2 && $options.goToStep2(...args))
  } : {}) : {}) : {}, {
    v: $data.step === 2
  }, $data.step === 2 ? common_vendor.e({
    w: common_vendor.t($data.posMap[$data.current.pos]),
    x: common_vendor.t($data.current.meaning),
    y: $data.showSpellingResult && $data.spellingResult ? 1 : "",
    z: $data.showSpellingResult && !$data.spellingResult ? 1 : "",
    A: common_vendor.o([($event) => $data.userInput = $event.detail.value, (...args) => $options.clearSpellingResult && $options.clearSpellingResult(...args)]),
    B: $data.userInput,
    C: common_vendor.o((...args) => $options.checkSpelling && $options.checkSpelling(...args)),
    D: !$data.userInput.trim(),
    E: $data.showSpellingResult
  }, $data.showSpellingResult ? {
    F: common_vendor.t($data.spellingResult ? "正确！" : `错误！正确答案是：${$data.current.word}`),
    G: $data.spellingResult ? 1 : "",
    H: !$data.spellingResult ? 1 : "",
    I: common_vendor.t($options.isLastQuestion ? "完成测试" : "下一题"),
    J: common_vendor.o((...args) => $options.nextQuestion && $options.nextQuestion(...args))
  } : {}) : {}) : {}, {
    K: $data.isQuizCompleted
  }, $data.isQuizCompleted ? {
    L: common_vendor.t($options.getResultIcon()),
    M: common_vendor.t($options.getResultComment()),
    N: common_vendor.t($data.quizWords.length),
    O: common_vendor.t($data.correctCount),
    P: common_vendor.t(Math.round($options.accuracy)),
    Q: common_vendor.f($data.quizResults, (result, index, i0) => {
      return {
        a: common_vendor.t(result.word),
        b: common_vendor.t(result.meaning),
        c: common_vendor.t(result.correct ? "✓" : "✗"),
        d: index,
        e: result.correct ? 1 : "",
        f: !result.correct ? 1 : ""
      };
    }),
    R: common_vendor.o((...args) => $options.retryQuiz && $options.retryQuiz(...args)),
    S: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3d73178e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/quiz/quiz.js.map
