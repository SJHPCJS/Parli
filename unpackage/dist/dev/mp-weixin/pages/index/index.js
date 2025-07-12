"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const _sfc_main = {
  data() {
    return {
      currentBook: {},
      learnedCount: 0,
      wrongCount: 0,
      progressPercent: 0
    };
  },
  computed: {
    suggestion() {
      if (this.wrongCount > 0) {
        return `您有 ${this.wrongCount} 个错题需要复习，建议先复习巩固！`;
      } else if (this.learnedCount < 10) {
        return "开始您的意大利语学习之旅吧！";
      } else if (this.progressPercent < 50) {
        return "学习进展不错，继续保持！";
      } else if (this.progressPercent < 100) {
        return "已经学习了一大半，加油完成这本书！";
      } else {
        return "恭喜完成这本书！可以尝试其他书籍或进行随机抽查！";
      }
    }
  },
  onShow() {
    this.loadStats();
  },
  methods: {
    loadStats() {
      this.currentBook = utils_bookData.getCurrentBook();
      const learnedWords = utils_bookData.getCurrentBookLearnedWords();
      const wrongWords = utils_bookData.getCurrentBookWrongWords();
      this.learnedCount = learnedWords.length;
      this.wrongCount = wrongWords.length;
      if (this.currentBook.wordCount > 0) {
        this.progressPercent = Math.round(this.learnedCount / this.currentBook.wordCount * 100);
      } else {
        this.progressPercent = 0;
      }
    },
    goLearn() {
      common_vendor.index.navigateTo({
        url: "/pages/learn/learn"
      });
    },
    goReview() {
      if (this.wrongCount === 0) {
        common_vendor.index.showToast({
          title: "暂无错题需要复习",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/review/review"
      });
    },
    goQuiz() {
      const currentBookWords = utils_bookData.getCurrentBookWords();
      const learnedWords = utils_bookData.getCurrentBookLearnedWords();
      if (currentBookWords.length === 0) {
        common_vendor.index.showToast({
          title: "当前书籍没有单词",
          icon: "none"
        });
        return;
      }
      if (learnedWords.length < 5) {
        common_vendor.index.showModal({
          title: "提示",
          content: "建议至少学习5个单词后再进行随机抽查，这样测试效果会更好。",
          confirmText: "继续测试",
          cancelText: "去学习",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/quiz/quiz"
              });
            } else {
              this.goLearn();
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/quiz/quiz"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.currentBook.cover),
    b: common_vendor.t($data.currentBook.title),
    c: common_vendor.t($data.currentBook.subtitle),
    d: $data.progressPercent + "%",
    e: common_vendor.t($data.progressPercent),
    f: common_vendor.t($data.learnedCount),
    g: common_vendor.t($data.wrongCount),
    h: common_vendor.t($data.currentBook.wordCount),
    i: common_vendor.o((...args) => $options.goLearn && $options.goLearn(...args)),
    j: common_vendor.t($data.wrongCount),
    k: common_vendor.o((...args) => $options.goReview && $options.goReview(...args)),
    l: common_vendor.o((...args) => $options.goQuiz && $options.goQuiz(...args)),
    m: $options.suggestion
  }, $options.suggestion ? {
    n: common_vendor.t($options.suggestion)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
