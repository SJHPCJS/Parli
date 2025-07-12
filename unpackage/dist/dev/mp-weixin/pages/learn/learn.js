"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const _sfc_main = {
  data() {
    return {
      step: 1,
      current: {},
      options: [],
      selectedOption: -1,
      showResult: false,
      step1Result: false,
      userInput: "",
      showSpellingResult: false,
      spellingResult: false,
      currentIndex: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      wrongAnswers: 0,
      isCompleted: false,
      questionWords: [],
      posMap: utils_bookData.posMap,
      currentBook: {}
    };
  },
  computed: {
    progressWidth() {
      return this.currentIndex / this.totalQuestions * 100;
    }
  },
  onLoad() {
    this.currentBook = utils_bookData.getCurrentBook();
    this.initLearning();
  },
  methods: {
    initLearning() {
      this.questionWords = [];
      const availableWords = [...utils_bookData.getCurrentBookWords()];
      if (availableWords.length === 0) {
        common_vendor.index.showModal({
          title: "提示",
          content: "当前书籍没有单词可供学习，请先选择其他书籍。",
          success: () => {
            common_vendor.index.switchTab({
              url: "/pages/books/books"
            });
          }
        });
        return;
      }
      const questionCount = Math.min(this.totalQuestions, availableWords.length);
      for (let i = 0; i < questionCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        this.questionWords.push(availableWords[randomIndex]);
        availableWords.splice(randomIndex, 1);
      }
      this.totalQuestions = questionCount;
      this.currentIndex = 0;
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
      this.isCompleted = false;
      this.loadQuestion();
    },
    loadQuestion() {
      if (this.currentIndex >= this.totalQuestions) {
        this.isCompleted = true;
        return;
      }
      this.current = this.questionWords[this.currentIndex];
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
        utils_bookData.addWrongWordToCurrentBook(this.current.id);
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
      if (this.spellingResult) {
        this.correctAnswers++;
        if (this.step1Result) {
          utils_bookData.removeWrongWordFromCurrentBook(this.current.id);
          utils_bookData.addLearnedWordToCurrentBook(this.current.id);
        }
      } else {
        this.wrongAnswers++;
        utils_bookData.addWrongWordToCurrentBook(this.current.id);
      }
    },
    clearSpellingResult() {
      this.showSpellingResult = false;
    },
    nextQuestion() {
      this.currentIndex++;
      this.loadQuestion();
    },
    restartLearning() {
      this.initLearning();
    },
    goHome() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.progressWidth + "%",
    b: common_vendor.t($data.currentIndex + 1),
    c: common_vendor.t($data.totalQuestions),
    d: $data.step === 1
  }, $data.step === 1 ? common_vendor.e({
    e: common_vendor.t($data.current.word),
    f: common_vendor.f($data.options, (option, index, i0) => {
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
    g: $data.showResult
  }, $data.showResult ? common_vendor.e({
    h: common_vendor.t($data.step1Result ? "正确！继续下一步" : "错误！请重新选择"),
    i: $data.step1Result ? 1 : "",
    j: !$data.step1Result ? 1 : "",
    k: $data.step1Result
  }, $data.step1Result ? {
    l: common_vendor.o((...args) => $options.goToStep2 && $options.goToStep2(...args))
  } : {}) : {}) : {}, {
    m: $data.step === 2
  }, $data.step === 2 ? common_vendor.e({
    n: common_vendor.t($data.posMap[$data.current.pos]),
    o: common_vendor.t($data.current.meaning),
    p: $data.showSpellingResult && $data.spellingResult ? 1 : "",
    q: $data.showSpellingResult && !$data.spellingResult ? 1 : "",
    r: common_vendor.o([($event) => $data.userInput = $event.detail.value, (...args) => $options.clearSpellingResult && $options.clearSpellingResult(...args)]),
    s: $data.userInput,
    t: common_vendor.o((...args) => $options.checkSpelling && $options.checkSpelling(...args)),
    v: !$data.userInput.trim(),
    w: $data.showSpellingResult
  }, $data.showSpellingResult ? {
    x: common_vendor.t($data.spellingResult ? "正确！" : `错误！正确答案是：${$data.current.word}`),
    y: $data.spellingResult ? 1 : "",
    z: !$data.spellingResult ? 1 : "",
    A: common_vendor.o((...args) => $options.nextQuestion && $options.nextQuestion(...args))
  } : {}) : {}, {
    B: $data.isCompleted
  }, $data.isCompleted ? {
    C: common_vendor.t($data.totalQuestions),
    D: common_vendor.t(Math.round($data.correctAnswers / $data.totalQuestions * 100)),
    E: common_vendor.t($data.wrongAnswers),
    F: common_vendor.o((...args) => $options.restartLearning && $options.restartLearning(...args)),
    G: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f23452e4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/learn/learn.js.map
