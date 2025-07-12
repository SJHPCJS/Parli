"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_bookData = require("../../utils/bookData.js");
const _sfc_main = {
  data() {
    return {
      bookList: utils_bookData.bookList,
      userInfo: {},
      totalLearnedWords: 0,
      totalStudyDays: 1,
      totalWrongWords: 0,
      achievements: [
        {
          id: 1,
          title: "初学者",
          description: "学习第一个单词",
          icon: "🌱",
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 1
        },
        {
          id: 2,
          title: "勤学者",
          description: "学习50个单词",
          icon: "📚",
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 50
        },
        {
          id: 3,
          title: "进步者",
          description: "学习100个单词",
          icon: "🚀",
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 100
        },
        {
          id: 4,
          title: "专家级",
          description: "学习200个单词",
          icon: "👑",
          unlocked: false,
          condition: (stats) => stats.totalLearnedWords >= 200
        },
        {
          id: 5,
          title: "完美主义者",
          description: "完成一本书的学习",
          icon: "💯",
          unlocked: false,
          condition: (stats) => stats.completedBooks >= 1
        },
        {
          id: 6,
          title: "坚持者",
          description: "连续学习7天",
          icon: "🔥",
          unlocked: false,
          condition: (stats) => stats.totalStudyDays >= 7
        }
      ]
    };
  },
  onLoad() {
    this.loadUserData();
  },
  onShow() {
    this.loadUserData();
  },
  methods: {
    loadUserData() {
      try {
        this.userInfo = common_vendor.index.getStorageSync("userInfo") || {};
      } catch (e) {
        this.userInfo = {};
      }
      this.calculateTotalStats();
      this.updateAchievements();
    },
    calculateTotalStats() {
      let totalLearned = 0;
      let totalWrong = 0;
      let completedBooks = 0;
      utils_bookData.bookList.forEach((book) => {
        const progress = utils_bookData.getBookProgress(book.id);
        totalLearned += progress.learnedWords.length;
        totalWrong += progress.wrongWords.length;
        if (progress.learnedWords.length >= book.wordCount) {
          completedBooks++;
        }
      });
      this.totalLearnedWords = totalLearned;
      this.totalWrongWords = totalWrong;
      this.completedBooks = completedBooks;
      try {
        const firstStudyDate = common_vendor.index.getStorageSync("firstStudyDate");
        if (firstStudyDate) {
          const now = /* @__PURE__ */ new Date();
          const firstDate = new Date(firstStudyDate);
          const diffTime = Math.abs(now - firstDate);
          this.totalStudyDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        } else {
          common_vendor.index.setStorageSync("firstStudyDate", (/* @__PURE__ */ new Date()).toISOString());
          this.totalStudyDays = 1;
        }
      } catch (e) {
        this.totalStudyDays = 1;
      }
    },
    updateAchievements() {
      const stats = {
        totalLearnedWords: this.totalLearnedWords,
        totalStudyDays: this.totalStudyDays,
        completedBooks: this.completedBooks
      };
      this.achievements.forEach((achievement) => {
        achievement.unlocked = achievement.condition(stats);
      });
    },
    getBookProgressPercent(bookId) {
      const progress = utils_bookData.getBookProgress(bookId);
      const book = utils_bookData.bookList.find((b) => b.id === bookId);
      if (!book)
        return 0;
      return Math.round(progress.learnedWords.length / book.wordCount * 100);
    },
    handleLogin() {
      common_vendor.index.getUserProfile({
        desc: "用于完善会员资料",
        success: (res) => {
          this.userInfo = res.userInfo;
          common_vendor.index.setStorageSync("userInfo", res.userInfo);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "登录失败",
            icon: "none"
          });
        }
      });
    },
    showStudyStats() {
      let statsText = "📊 详细学习统计\n\n";
      statsText += `总学习词汇：${this.totalLearnedWords}个
`;
      statsText += `学习天数：${this.totalStudyDays}天
`;
      statsText += `总错题数：${this.totalWrongWords}个
`;
      statsText += `完成书籍：${this.completedBooks}本

`;
      utils_bookData.bookList.forEach((book) => {
        utils_bookData.getBookProgress(book.id);
        const percent = this.getBookProgressPercent(book.id);
        statsText += `${book.title}：${percent}%
`;
      });
      common_vendor.index.showModal({
        title: "学习统计",
        content: statsText,
        showCancel: false
      });
    },
    exportAllData() {
      const exportData = {
        exportTime: (/* @__PURE__ */ new Date()).toLocaleString(),
        userInfo: this.userInfo,
        stats: {
          totalLearnedWords: this.totalLearnedWords,
          totalStudyDays: this.totalStudyDays,
          totalWrongWords: this.totalWrongWords
        },
        books: {}
      };
      utils_bookData.bookList.forEach((book) => {
        exportData.books[book.id] = {
          title: book.title,
          progress: utils_bookData.getBookProgress(book.id),
          progressPercent: this.getBookProgressPercent(book.id)
        };
      });
      common_vendor.index.showModal({
        title: "导出数据",
        content: "学习数据已生成，请在控制台查看并复制保存。",
        showCancel: false,
        success: () => {
          common_vendor.index.__f__("log", "at pages/profile/profile.vue:323", "Export data:", JSON.stringify(exportData, null, 2));
        }
      });
    },
    importData() {
      common_vendor.index.showModal({
        title: "导入数据",
        content: "此功能需要先导出数据，然后通过开发者工具导入。",
        showCancel: false
      });
    },
    resetAllData() {
      common_vendor.index.showModal({
        title: "重置所有数据",
        content: "确定要重置所有学习数据吗？此操作不可恢复！",
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
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.removeStorageSync("firstStudyDate");
            this.loadUserData();
            common_vendor.index.showToast({
              title: "重置成功",
              icon: "success"
            });
          }
        }
      });
    },
    showAbout() {
      common_vendor.index.showModal({
        title: "关于记意 Parli",
        content: "记意 Parli v1.0\n\n一个简洁高效的意大利语单词学习应用\n\n功能特色：\n• 多书籍学习系统\n• 智能错题复习\n• 学习进度追踪\n• 随机抽查测试\n\n让意大利语学习变得更简单！",
        showCancel: false
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.userInfo.nickName || "点击登录"),
    b: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    c: common_vendor.t($data.totalLearnedWords),
    d: common_vendor.t($data.totalStudyDays),
    e: common_vendor.t($data.totalWrongWords),
    f: common_vendor.f($data.achievements, (achievement, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(achievement.icon),
        b: common_vendor.t(achievement.title),
        c: common_vendor.t(achievement.description),
        d: achievement.unlocked
      }, achievement.unlocked ? {} : {}, {
        e: achievement.id,
        f: achievement.unlocked ? 1 : ""
      });
    }),
    g: common_vendor.f($data.bookList, (book, k0, i0) => {
      return {
        a: common_vendor.t(book.cover),
        b: common_vendor.t(book.title),
        c: $options.getBookProgressPercent(book.id) + "%",
        d: book.color,
        e: common_vendor.t($options.getBookProgressPercent(book.id)),
        f: book.id
      };
    }),
    h: common_vendor.o((...args) => $options.showStudyStats && $options.showStudyStats(...args)),
    i: common_vendor.o((...args) => $options.exportAllData && $options.exportAllData(...args)),
    j: common_vendor.o((...args) => $options.importData && $options.importData(...args)),
    k: common_vendor.o((...args) => $options.resetAllData && $options.resetAllData(...args)),
    l: common_vendor.o((...args) => $options.showAbout && $options.showAbout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
