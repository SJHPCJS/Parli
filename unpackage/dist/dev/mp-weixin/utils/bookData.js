"use strict";
const common_vendor = require("../common/vendor.js");
const utils_wordData = require("./wordData.js");
const bookList = [
  {
    id: 1,
    title: "意大利语词典",
    subtitle: "45893完整词典",
    cover: "📖",
    description: "包含44592个词汇的完整意大利语-中文词典，权威全面",
    difficulty: "全部",
    wordCount: utils_wordData.wordList.length,
    color: "#6c5ce7"
  }
];
const bookWords = {
  1: utils_wordData.wordList
  // 全部词汇
};
function getCurrentBook() {
  try {
    const currentBookId = common_vendor.index.getStorageSync("current_book_id") || 1;
    return bookList.find((book) => book.id === currentBookId) || bookList[0];
  } catch (e) {
    return bookList[0];
  }
}
function setCurrentBook(bookId) {
  try {
    common_vendor.index.setStorageSync("current_book_id", bookId);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:39", "设置当前书籍失败:", e);
  }
}
function getCurrentBookWords() {
  const currentBook = getCurrentBook();
  return bookWords[currentBook.id] || [];
}
function getBookProgress(bookId) {
  try {
    const progressKey = `book_progress_${bookId}`;
    const progress = common_vendor.index.getStorageSync(progressKey) || {
      learned: 0,
      total: bookWords[bookId] ? bookWords[bookId].length : 0,
      percentage: 0
    };
    return progress;
  } catch (e) {
    return {
      learned: 0,
      total: bookWords[bookId] ? bookWords[bookId].length : 0,
      percentage: 0
    };
  }
}
function saveBookProgress(bookId, progress) {
  try {
    const progressKey = `book_progress_${bookId}`;
    common_vendor.index.setStorageSync(progressKey, progress);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:74", "保存书籍进度失败:", e);
  }
}
function getCurrentBookWrongWords() {
  const currentBook = getCurrentBook();
  try {
    const wrongWordsKey = `wrong_words_book_${currentBook.id}`;
    const wrongWordIds = common_vendor.index.getStorageSync(wrongWordsKey) || [];
    const bookWordsData = bookWords[currentBook.id] || [];
    return wrongWordIds.map((id) => bookWordsData.find((word) => word.id === id)).filter(Boolean);
  } catch (e) {
    return [];
  }
}
function getCurrentBookLearnedWords() {
  const currentBook = getCurrentBook();
  try {
    const learnedWordsKey = `learned_words_book_${currentBook.id}`;
    const learnedWordIds = common_vendor.index.getStorageSync(learnedWordsKey) || [];
    const bookWordsData = bookWords[currentBook.id] || [];
    return learnedWordIds.map((id) => bookWordsData.find((word) => word.id === id)).filter(Boolean);
  } catch (e) {
    return [];
  }
}
function addWrongWordToCurrentBook(wordId) {
  const currentBook = getCurrentBook();
  try {
    const wrongWordsKey = `wrong_words_book_${currentBook.id}`;
    const wrongWordIds = common_vendor.index.getStorageSync(wrongWordsKey) || [];
    if (!wrongWordIds.includes(wordId)) {
      wrongWordIds.push(wordId);
      common_vendor.index.setStorageSync(wrongWordsKey, wrongWordIds);
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:115", "添加错题失败:", e);
  }
}
function removeWrongWordFromCurrentBook(wordId) {
  const currentBook = getCurrentBook();
  try {
    const wrongWordsKey = `wrong_words_book_${currentBook.id}`;
    const wrongWordIds = common_vendor.index.getStorageSync(wrongWordsKey) || [];
    const index = wrongWordIds.indexOf(wordId);
    if (index > -1) {
      wrongWordIds.splice(index, 1);
      common_vendor.index.setStorageSync(wrongWordsKey, wrongWordIds);
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:131", "移除错题失败:", e);
  }
}
function addLearnedWordToCurrentBook(wordId) {
  const currentBook = getCurrentBook();
  try {
    const learnedWordsKey = `learned_words_book_${currentBook.id}`;
    const learnedWordIds = common_vendor.index.getStorageSync(learnedWordsKey) || [];
    if (!learnedWordIds.includes(wordId)) {
      learnedWordIds.push(wordId);
      common_vendor.index.setStorageSync(learnedWordsKey, learnedWordIds);
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:146", "添加已学词汇失败:", e);
  }
}
function getRandomWordsForQuiz(count = 10) {
  const currentBookWords = getCurrentBookWords();
  if (currentBookWords.length === 0)
    return [];
  const shuffled = [...currentBookWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
exports.addLearnedWordToCurrentBook = addLearnedWordToCurrentBook;
exports.addWrongWordToCurrentBook = addWrongWordToCurrentBook;
exports.bookList = bookList;
exports.getBookProgress = getBookProgress;
exports.getCurrentBook = getCurrentBook;
exports.getCurrentBookLearnedWords = getCurrentBookLearnedWords;
exports.getCurrentBookWords = getCurrentBookWords;
exports.getCurrentBookWrongWords = getCurrentBookWrongWords;
exports.getRandomWordsForQuiz = getRandomWordsForQuiz;
exports.removeWrongWordFromCurrentBook = removeWrongWordFromCurrentBook;
exports.saveBookProgress = saveBookProgress;
exports.setCurrentBook = setCurrentBook;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/bookData.js.map
