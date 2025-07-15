"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const utils_wordData = require("../../utils/wordData.js");
const _sfc_main = {
  data() {
    return {
      searchQuery: "",
      searchResults: [],
      hasSearched: false,
      searchHistory: [],
      recommendWords: [],
      allWords: [],
      learnedWords: [],
      posMap: utils_wordData.posMap
    };
  },
  onLoad() {
    this.loadData();
    this.loadSearchHistory();
    this.loadRecommendWords();
  },
  methods: {
    loadData() {
      this.allWords = utils_bookData.getCurrentBookWords();
      this.learnedWords = utils_bookData.getCurrentBookLearnedWords();
    },
    loadSearchHistory() {
      try {
        const history = common_vendor.index.getStorageSync("search_history") || [];
        this.searchHistory = history.slice(0, 10);
      } catch (e) {
        this.searchHistory = [];
      }
    },
    loadRecommendWords() {
      const shuffled = [...this.allWords].sort(() => 0.5 - Math.random());
      this.recommendWords = shuffled.slice(0, 20);
    },
    onSearchInput() {
      if (this.searchQuery.trim()) {
        this.performSearch();
      } else {
        this.searchResults = [];
        this.hasSearched = false;
      }
    },
    performSearch() {
      const query = this.searchQuery.trim();
      if (!query) {
        this.searchResults = [];
        this.hasSearched = false;
        return;
      }
      this.hasSearched = true;
      const results = this.allWords.filter((word) => {
        const wordMatch = word.word.toLowerCase().includes(query.toLowerCase());
        const meaningMatch = word.meaning.includes(query);
        return wordMatch || meaningMatch;
      });
      this.searchResults = results.sort((a, b) => {
        const aWordExact = a.word.toLowerCase() === query.toLowerCase();
        const bWordExact = b.word.toLowerCase() === query.toLowerCase();
        const aMeaningExact = a.meaning === query;
        const bMeaningExact = b.meaning === query;
        if (aWordExact && !bWordExact)
          return -1;
        if (!aWordExact && bWordExact)
          return 1;
        if (aMeaningExact && !bMeaningExact)
          return -1;
        if (!aMeaningExact && bMeaningExact)
          return 1;
        return 0;
      });
      this.saveSearchHistory(query);
    },
    saveSearchHistory(query) {
      try {
        let history = common_vendor.index.getStorageSync("search_history") || [];
        history = history.filter((item) => item !== query);
        history.unshift(query);
        history = history.slice(0, 50);
        common_vendor.index.setStorageSync("search_history", history);
        this.searchHistory = history.slice(0, 10);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/search/search.vue:207", "保存搜索历史失败:", e);
      }
    },
    searchFromHistory(query) {
      this.searchQuery = query;
      this.performSearch();
    },
    clearHistory() {
      common_vendor.index.showModal({
        title: "确认",
        content: "确定要清空搜索历史吗？",
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.removeStorageSync("search_history");
              this.searchHistory = [];
              common_vendor.index.showToast({
                title: "已清空历史记录",
                icon: "success"
              });
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/search/search.vue:230", "清空历史记录失败:", e);
            }
          }
        }
      });
    },
    isWordLearned(wordId) {
      return this.learnedWords.some((word) => word.id === wordId);
    },
    goToWordDetail(word) {
      common_vendor.index.navigateTo({
        url: `/pages/wordDetail/wordDetail?wordId=${word.id}&fromPage=search`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o([($event) => $data.searchQuery = $event.detail.value, (...args) => $options.onSearchInput && $options.onSearchInput(...args)]),
    b: common_vendor.o((...args) => $options.performSearch && $options.performSearch(...args)),
    c: $data.searchQuery,
    d: common_vendor.o((...args) => $options.performSearch && $options.performSearch(...args)),
    e: !$data.searchQuery
  }, !$data.searchQuery ? {} : {}, {
    f: $data.searchResults.length > 0
  }, $data.searchResults.length > 0 ? {
    g: common_vendor.t($data.searchResults.length),
    h: common_vendor.f($data.searchResults, (word, k0, i0) => {
      return {
        a: common_vendor.t(word.word),
        b: common_vendor.t($data.posMap[word.pos]),
        c: common_vendor.t(word.meaning),
        d: $options.isWordLearned(word.id) ? 1 : "",
        e: common_vendor.t($options.isWordLearned(word.id) ? "已学" : "未学"),
        f: word.id,
        g: common_vendor.o(($event) => $options.goToWordDetail(word), word.id)
      };
    })
  } : {}, {
    i: $data.hasSearched && $data.searchResults.length === 0
  }, $data.hasSearched && $data.searchResults.length === 0 ? {} : {}, {
    j: !$data.hasSearched && $data.searchHistory.length > 0
  }, !$data.hasSearched && $data.searchHistory.length > 0 ? {
    k: common_vendor.o((...args) => $options.clearHistory && $options.clearHistory(...args)),
    l: common_vendor.f($data.searchHistory, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: common_vendor.o(($event) => $options.searchFromHistory(item), index)
      };
    })
  } : {}, {
    m: !$data.hasSearched && $data.searchHistory.length === 0
  }, !$data.hasSearched && $data.searchHistory.length === 0 ? {
    n: common_vendor.f($data.recommendWords, (word, k0, i0) => {
      return {
        a: common_vendor.t(word.word),
        b: common_vendor.t(word.meaning),
        c: word.id,
        d: common_vendor.o(($event) => $options.goToWordDetail(word), word.id)
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c10c040c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/search/search.js.map
