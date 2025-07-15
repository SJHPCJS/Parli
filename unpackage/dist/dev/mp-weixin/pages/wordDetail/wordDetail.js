"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const utils_wordData = require("../../utils/wordData.js");
const _sfc_main = {
  data() {
    return {
      wordData: {},
      isLearned: false,
      isWrong: false,
      showContinue: false,
      fromPage: "",
      // 来源页面：learn, review, search
      posMap: utils_wordData.posMap
    };
  },
  onLoad(options) {
    const { wordId, fromPage } = options;
    this.fromPage = fromPage || "search";
    this.showContinue = fromPage === "learn" || fromPage === "review";
    this.loadWordData(wordId);
    this.loadWordStatus(wordId);
  },
  methods: {
    loadWordData(wordId) {
      const allWords = utils_bookData.getCurrentBookWords();
      this.wordData = allWords.find((word) => word.id == wordId) || {};
      if (!this.wordData.id) {
        common_vendor.index.showToast({
          title: "单词不存在",
          icon: "error"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    },
    loadWordStatus(wordId) {
      const learnedWords = utils_bookData.getCurrentBookLearnedWords();
      const wrongWords = utils_bookData.getCurrentBookWrongWords();
      this.isLearned = learnedWords.some((word) => word.id == wordId);
      this.isWrong = wrongWords.some((word) => word.id == wordId);
    },
    playPronunciation() {
      common_vendor.index.showToast({
        title: "发音：" + this.wordData.word,
        icon: "none",
        duration: 2e3
      });
    },
    toggleLearned() {
      if (this.isLearned) {
        utils_bookData.removeLearnedWordFromCurrentBook(this.wordData.id);
        this.isLearned = false;
        common_vendor.index.showToast({
          title: "已移出已学词汇",
          icon: "success"
        });
      } else {
        utils_bookData.addLearnedWordToCurrentBook(this.wordData.id);
        this.isLearned = true;
        common_vendor.index.showToast({
          title: "已标记为已学",
          icon: "success"
        });
      }
    },
    toggleWrong() {
      if (this.isWrong) {
        utils_bookData.removeWrongWordFromCurrentBook(this.wordData.id);
        this.isWrong = false;
        common_vendor.index.showToast({
          title: "已移出错题",
          icon: "success"
        });
      } else {
        utils_bookData.addWrongWordToCurrentBook(this.wordData.id);
        this.isWrong = true;
        common_vendor.index.showToast({
          title: "已加入错题",
          icon: "success"
        });
      }
    },
    continueNext() {
      common_vendor.index.navigateBack({
        success: () => {
          common_vendor.index.$emit("continueNext");
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.wordData.word),
    b: common_vendor.t($data.posMap[$data.wordData.pos]),
    c: common_vendor.o((...args) => $options.playPronunciation && $options.playPronunciation(...args)),
    d: common_vendor.t($data.wordData.meaning),
    e: common_vendor.t($data.posMap[$data.wordData.pos]),
    f: $data.isLearned ? 1 : "",
    g: $data.isWrong ? 1 : "",
    h: common_vendor.t($data.isLearned ? "标记为未学" : "标记为已学"),
    i: common_vendor.o((...args) => $options.toggleLearned && $options.toggleLearned(...args)),
    j: common_vendor.t($data.isWrong ? "移出错题" : "加入错题"),
    k: common_vendor.o((...args) => $options.toggleWrong && $options.toggleWrong(...args)),
    l: $data.showContinue
  }, $data.showContinue ? {
    m: common_vendor.o((...args) => $options.continueNext && $options.continueNext(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-91103bba"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wordDetail/wordDetail.js.map
