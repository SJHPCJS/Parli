"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const _sfc_main = {
  data() {
    return {
      bookList: utils_bookData.bookList,
      currentBook: {}
    };
  },
  onLoad() {
    this.currentBook = utils_bookData.getCurrentBook();
  },
  onShow() {
    this.currentBook = utils_bookData.getCurrentBook();
  },
  methods: {
    selectBook(book) {
      if (this.currentBook.id === book.id)
        return;
      utils_bookData.setCurrentBook(book.id);
      this.currentBook = book;
      common_vendor.index.showToast({
        title: `已切换到《${book.title}》`,
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.switchTab({
          url: "/pages/index/index"
        });
      }, 1e3);
    },
    getBookProgressPercent(bookId) {
      const progress = utils_bookData.getBookProgress(bookId);
      const bookWords = this.getBookWordsCount(bookId);
      if (bookWords === 0)
        return 0;
      return Math.round(progress.learnedWords.length / bookWords * 100);
    },
    getBookWrongCount(bookId) {
      const progress = utils_bookData.getBookProgress(bookId);
      return progress.wrongWords.length;
    },
    getBookWordsCount(bookId) {
      const book = utils_bookData.bookList.find((b) => b.id === bookId);
      return book ? book.wordCount : 0;
    },
    showAllProgress() {
      let progressText = "📚 总体学习进度：\n\n";
      utils_bookData.bookList.forEach((book) => {
        const percent = this.getBookProgressPercent(book.id);
        const wrongCount = this.getBookWrongCount(book.id);
        progressText += `${book.title}
进度：${percent}% | 错题：${wrongCount}个

`;
      });
      common_vendor.index.showModal({
        title: "学习统计",
        content: progressText,
        showCancel: false
      });
    },
    resetAllProgress() {
      common_vendor.index.showModal({
        title: "重置所有数据",
        content: "确定要重置所有书籍的学习进度吗？此操作不可恢复。",
        success: (res) => {
          if (res.confirm) {
            utils_bookData.bookList.forEach((book) => {
              const emptyProgress = {
                learnedWords: [],
                wrongWords: [],
                reviewWords: []
              };
              utils_bookData.saveBookProgress(book.id, emptyProgress);
            });
            common_vendor.index.showToast({
              title: "重置成功",
              icon: "success"
            });
          }
        }
      });
    },
    exportProgress() {
      let exportData = {
        exportTime: (/* @__PURE__ */ new Date()).toLocaleString(),
        books: {}
      };
      utils_bookData.bookList.forEach((book) => {
        const progress = utils_bookData.getBookProgress(book.id);
        exportData.books[book.id] = {
          title: book.title,
          progress,
          progressPercent: this.getBookProgressPercent(book.id)
        };
      });
      const jsonStr = JSON.stringify(exportData, null, 2);
      common_vendor.index.showModal({
        title: "导出数据",
        content: "学习数据已生成，请复制保存。",
        showCancel: false,
        success: () => {
          common_vendor.index.__f__("log", "at pages/books/books.vue:191", "Export data:", jsonStr);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.bookList.length),
    b: common_vendor.f($data.bookList, (book, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(book.cover),
        b: common_vendor.t(book.title),
        c: common_vendor.t(book.subtitle),
        d: common_vendor.t(book.description),
        e: common_vendor.t(book.difficulty),
        f: common_vendor.t(book.wordCount),
        g: common_vendor.t($options.getBookProgressPercent(book.id)),
        h: common_vendor.t($options.getBookWrongCount(book.id)),
        i: $options.getBookProgressPercent(book.id) + "%",
        j: $data.currentBook.id === book.id
      }, $data.currentBook.id === book.id ? {} : {}, {
        k: book.id,
        l: $data.currentBook.id === book.id ? 1 : "",
        m: `linear-gradient(135deg, ${book.color}99, ${book.color}dd)`,
        n: common_vendor.o(($event) => $options.selectBook(book), book.id)
      });
    }),
    c: common_vendor.o((...args) => $options.showAllProgress && $options.showAllProgress(...args)),
    d: common_vendor.o((...args) => $options.resetAllProgress && $options.resetAllProgress(...args)),
    e: common_vendor.o((...args) => $options.exportProgress && $options.exportProgress(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-89fff6df"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/books/books.js.map
