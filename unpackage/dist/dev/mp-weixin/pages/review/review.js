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
      totalQuestions: 0,
      masteredWords: 0,
      remainingWords: 0,
      isCompleted: false,
      wrongWords: [],
      hasWrongWords: false,
      posMap: utils_bookData.posMap,
      currentBook: {}
    };
  },
  computed: {
    progressWidth() {
      return this.totalQuestions > 0 ? this.currentIndex / this.totalQuestions * 100 : 0;
    }
  },
  onLoad() {
    this.currentBook = utils_bookData.getCurrentBook();
    this.initReview();
  },
  onShow() {
    this.initReview();
  },
  methods: {
    initReview() {
      this.wrongWords = utils_bookData.getCurrentBookWrongWords();
      this.hasWrongWords = this.wrongWords.length > 0;
      if (this.hasWrongWords) {
        this.totalQuestions = this.wrongWords.length;
        this.currentIndex = 0;
        this.masteredWords = 0;
        this.remainingWords = 0;
        this.isCompleted = false;
        this.loadQuestion();
      }
    },
    loadQuestion() {
      if (this.currentIndex >= this.totalQuestions) {
        this.isCompleted = true;
        return;
      }
      this.current = this.wrongWords[this.currentIndex];
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
      if (this.spellingResult && this.step1Result) {
        utils_bookData.removeWrongWordFromCurrentBook(this.current.id);
        utils_bookData.addLearnedWordToCurrentBook(this.current.id);
        this.masteredWords++;
      } else {
        this.remainingWords++;
      }
    },
    clearSpellingResult() {
      this.showSpellingResult = false;
    },
    nextQuestion() {
      this.currentIndex++;
      this.loadQuestion();
    },
    restartReview() {
      this.initReview();
    },
    goHome() {
      common_vendor.index.navigateBack();
    },
    goToLearn() {
      common_vendor.index.redirectTo({
        url: "/pages/learn/learn"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.hasWrongWords
  }, !$data.hasWrongWords ? {
    b: common_vendor.o((...args) => $options.goToLearn && $options.goToLearn(...args))
  } : common_vendor.e({
    c: $options.progressWidth + "%",
    d: common_vendor.t($data.currentIndex + 1),
    e: common_vendor.t($data.totalQuestions),
    f: $data.step === 1
  }, $data.step === 1 ? common_vendor.e({
    g: common_vendor.t($data.current.word),
    h: common_vendor.f($data.options, (option, index, i0) => {
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
    i: $data.showResult
  }, $data.showResult ? common_vendor.e({
    j: common_vendor.t($data.step1Result ? "正确！继续下一步" : "错误！请重新选择"),
    k: $data.step1Result ? 1 : "",
    l: !$data.step1Result ? 1 : "",
    m: $data.step1Result
  }, $data.step1Result ? {
    n: common_vendor.o((...args) => $options.goToStep2 && $options.goToStep2(...args))
  } : {}) : {}) : {}, {
    o: $data.step === 2
  }, $data.step === 2 ? common_vendor.e({
    p: common_vendor.t($data.posMap[$data.current.pos]),
    q: common_vendor.t($data.current.meaning),
    r: $data.showSpellingResult && $data.spellingResult ? 1 : "",
    s: $data.showSpellingResult && !$data.spellingResult ? 1 : "",
    t: common_vendor.o([($event) => $data.userInput = $event.detail.value, (...args) => $options.clearSpellingResult && $options.clearSpellingResult(...args)]),
    v: $data.userInput,
    w: common_vendor.o((...args) => $options.checkSpelling && $options.checkSpelling(...args)),
    x: !$data.userInput.trim(),
    y: $data.showSpellingResult
  }, $data.showSpellingResult ? {
    z: common_vendor.t($data.spellingResult ? "正确！" : `错误！正确答案是：${$data.current.word}`),
    A: $data.spellingResult ? 1 : "",
    B: !$data.spellingResult ? 1 : "",
    C: common_vendor.o((...args) => $options.nextQuestion && $options.nextQuestion(...args))
  } : {}) : {}, {
    D: $data.isCompleted
  }, $data.isCompleted ? {
    E: common_vendor.t($data.totalQuestions),
    F: common_vendor.t($data.masteredWords),
    G: common_vendor.t($data.remainingWords),
    H: common_vendor.o((...args) => $options.restartReview && $options.restartReview(...args)),
    I: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7018a65d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/review/review.js.map
