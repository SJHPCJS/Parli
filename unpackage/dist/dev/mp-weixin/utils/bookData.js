"use strict";
const common_vendor = require("../common/vendor.js");
const posMap = {
  "n": "名词",
  "v": "动词",
  "adj": "形容词",
  "adv": "副词",
  "prep": "介词",
  "pron": "代词",
  "conj": "连词"
};
const bookList = [
  {
    id: 1,
    title: "意大利语入门",
    subtitle: "基础词汇必备",
    cover: "📚",
    description: "最基础的意大利语词汇，适合初学者",
    difficulty: "入门",
    wordCount: 50,
    color: "#667eea"
  },
  {
    id: 2,
    title: "日常交流",
    subtitle: "生活场景词汇",
    cover: "🗣️",
    description: "日常生活中最常用的词汇",
    difficulty: "初级",
    wordCount: 60,
    color: "#fd79a8"
  },
  {
    id: 3,
    title: "旅行必备",
    subtitle: "旅游场景词汇",
    cover: "✈️",
    description: "意大利旅行必备词汇",
    difficulty: "初级",
    wordCount: 45,
    color: "#fdcb6e"
  },
  {
    id: 4,
    title: "商务意语",
    subtitle: "商务场景词汇",
    cover: "💼",
    description: "商务场合常用词汇",
    difficulty: "中级",
    wordCount: 40,
    color: "#6c5ce7"
  }
];
const bookWords = {
  1: [
    // 意大利语入门
    // 基础动词
    { id: 1, word: "parlare", meaning: "说话", pos: "v", difficulty: 1 },
    { id: 2, word: "mangiare", meaning: "吃", pos: "v", difficulty: 1 },
    { id: 3, word: "bere", meaning: "喝", pos: "v", difficulty: 1 },
    { id: 4, word: "dormire", meaning: "睡觉", pos: "v", difficulty: 1 },
    { id: 5, word: "leggere", meaning: "读", pos: "v", difficulty: 1 },
    { id: 6, word: "scrivere", meaning: "写", pos: "v", difficulty: 1 },
    { id: 7, word: "camminare", meaning: "走路", pos: "v", difficulty: 1 },
    { id: 8, word: "correre", meaning: "跑", pos: "v", difficulty: 1 },
    { id: 9, word: "amare", meaning: "爱", pos: "v", difficulty: 1 },
    { id: 10, word: "lavorare", meaning: "工作", pos: "v", difficulty: 1 },
    // 基础名词
    { id: 11, word: "libro", meaning: "书", pos: "n", difficulty: 1 },
    { id: 12, word: "casa", meaning: "家", pos: "n", difficulty: 1 },
    { id: 13, word: "famiglia", meaning: "家庭", pos: "n", difficulty: 1 },
    { id: 14, word: "tempo", meaning: "时间", pos: "n", difficulty: 1 },
    { id: 15, word: "acqua", meaning: "水", pos: "n", difficulty: 1 },
    { id: 16, word: "pane", meaning: "面包", pos: "n", difficulty: 1 },
    { id: 17, word: "macchina", meaning: "汽车", pos: "n", difficulty: 1 },
    { id: 18, word: "scuola", meaning: "学校", pos: "n", difficulty: 1 },
    { id: 19, word: "amico", meaning: "朋友", pos: "n", difficulty: 1 },
    { id: 20, word: "giorno", meaning: "天", pos: "n", difficulty: 1 },
    // 基础形容词
    { id: 21, word: "bello", meaning: "美丽的", pos: "adj", difficulty: 1 },
    { id: 22, word: "buono", meaning: "好的", pos: "adj", difficulty: 1 },
    { id: 23, word: "grande", meaning: "大的", pos: "adj", difficulty: 1 },
    { id: 24, word: "piccolo", meaning: "小的", pos: "adj", difficulty: 1 },
    { id: 25, word: "nuovo", meaning: "新的", pos: "adj", difficulty: 1 },
    { id: 26, word: "vecchio", meaning: "老的", pos: "adj", difficulty: 1 },
    { id: 27, word: "felice", meaning: "开心的", pos: "adj", difficulty: 1 },
    { id: 28, word: "triste", meaning: "悲伤的", pos: "adj", difficulty: 1 },
    { id: 29, word: "facile", meaning: "容易的", pos: "adj", difficulty: 1 },
    { id: 30, word: "difficile", meaning: "困难的", pos: "adj", difficulty: 1 },
    // 基础副词
    { id: 31, word: "velocemente", meaning: "迅速地", pos: "adv", difficulty: 1 },
    { id: 32, word: "lentamente", meaning: "缓慢地", pos: "adv", difficulty: 1 },
    { id: 33, word: "bene", meaning: "好地", pos: "adv", difficulty: 1 },
    { id: 34, word: "male", meaning: "坏地", pos: "adv", difficulty: 1 },
    { id: 35, word: "sempre", meaning: "总是", pos: "adv", difficulty: 1 },
    { id: 36, word: "mai", meaning: "从不", pos: "adv", difficulty: 1 },
    { id: 37, word: "oggi", meaning: "今天", pos: "adv", difficulty: 1 },
    { id: 38, word: "ieri", meaning: "昨天", pos: "adv", difficulty: 1 },
    { id: 39, word: "domani", meaning: "明天", pos: "adv", difficulty: 1 },
    { id: 40, word: "molto", meaning: "很", pos: "adv", difficulty: 1 },
    // 进阶词汇
    { id: 41, word: "università", meaning: "大学", pos: "n", difficulty: 2 },
    { id: 42, word: "conoscenza", meaning: "知识", pos: "n", difficulty: 2 },
    { id: 43, word: "bellezza", meaning: "美丽", pos: "n", difficulty: 2 },
    { id: 44, word: "saggezza", meaning: "智慧", pos: "n", difficulty: 2 },
    { id: 45, word: "felicità", meaning: "幸福", pos: "n", difficulty: 2 },
    { id: 46, word: "intelligente", meaning: "聪明的", pos: "adj", difficulty: 2 },
    { id: 47, word: "interessante", meaning: "有趣的", pos: "adj", difficulty: 2 },
    { id: 48, word: "importante", meaning: "重要的", pos: "adj", difficulty: 2 },
    { id: 49, word: "necessario", meaning: "必要的", pos: "adj", difficulty: 2 },
    { id: 50, word: "possibile", meaning: "可能的", pos: "adj", difficulty: 2 }
  ],
  2: [
    // 日常交流
    { id: 101, word: "ciao", meaning: "你好/再见", pos: "interj", difficulty: 1 },
    { id: 102, word: "grazie", meaning: "谢谢", pos: "interj", difficulty: 1 },
    { id: 103, word: "prego", meaning: "不客气", pos: "interj", difficulty: 1 },
    { id: 104, word: "scusi", meaning: "对不起", pos: "interj", difficulty: 1 },
    { id: 105, word: "nome", meaning: "名字", pos: "n", difficulty: 1 },
    { id: 106, word: "chiamare", meaning: "叫", pos: "v", difficulty: 1 },
    { id: 107, word: "abitare", meaning: "居住", pos: "v", difficulty: 1 },
    { id: 108, word: "città", meaning: "城市", pos: "n", difficulty: 1 },
    { id: 109, word: "paese", meaning: "国家", pos: "n", difficulty: 1 },
    { id: 110, word: "numero", meaning: "数字", pos: "n", difficulty: 1 },
    { id: 111, word: "telefono", meaning: "电话", pos: "n", difficulty: 1 },
    { id: 112, word: "indirizzo", meaning: "地址", pos: "n", difficulty: 1 },
    { id: 113, word: "strada", meaning: "街道", pos: "n", difficulty: 1 },
    { id: 114, word: "comprare", meaning: "买", pos: "v", difficulty: 1 },
    { id: 115, word: "vendere", meaning: "卖", pos: "v", difficulty: 1 },
    { id: 116, word: "soldi", meaning: "钱", pos: "n", difficulty: 1 },
    { id: 117, word: "euro", meaning: "欧元", pos: "n", difficulty: 1 },
    { id: 118, word: "negozio", meaning: "商店", pos: "n", difficulty: 1 },
    { id: 119, word: "mercato", meaning: "市场", pos: "n", difficulty: 1 },
    { id: 120, word: "prezzo", meaning: "价格", pos: "n", difficulty: 1 },
    { id: 121, word: "quanto", meaning: "多少", pos: "adv", difficulty: 1 },
    { id: 122, word: "dove", meaning: "哪里", pos: "adv", difficulty: 1 },
    { id: 123, word: "quando", meaning: "什么时候", pos: "adv", difficulty: 1 },
    { id: 124, word: "perché", meaning: "为什么", pos: "adv", difficulty: 1 },
    { id: 125, word: "come", meaning: "怎么样", pos: "adv", difficulty: 1 },
    { id: 126, word: "cosa", meaning: "什么", pos: "pron", difficulty: 1 },
    { id: 127, word: "chi", meaning: "谁", pos: "pron", difficulty: 1 },
    { id: 128, word: "quale", meaning: "哪个", pos: "pron", difficulty: 1 },
    { id: 129, word: "aiuto", meaning: "帮助", pos: "n", difficulty: 1 },
    { id: 130, word: "aiutare", meaning: "帮助", pos: "v", difficulty: 1 },
    { id: 131, word: "problema", meaning: "问题", pos: "n", difficulty: 1 },
    { id: 132, word: "soluzione", meaning: "解决方案", pos: "n", difficulty: 1 },
    { id: 133, word: "capire", meaning: "理解", pos: "v", difficulty: 1 },
    { id: 134, word: "sapere", meaning: "知道", pos: "v", difficulty: 1 },
    { id: 135, word: "conoscere", meaning: "认识", pos: "v", difficulty: 1 },
    { id: 136, word: "parlare", meaning: "说话", pos: "v", difficulty: 1 },
    { id: 137, word: "ascoltare", meaning: "听", pos: "v", difficulty: 1 },
    { id: 138, word: "sentire", meaning: "感觉", pos: "v", difficulty: 1 },
    { id: 139, word: "vedere", meaning: "看", pos: "v", difficulty: 1 },
    { id: 140, word: "guardare", meaning: "看", pos: "v", difficulty: 1 },
    { id: 141, word: "trovare", meaning: "找到", pos: "v", difficulty: 1 },
    { id: 142, word: "cercare", meaning: "寻找", pos: "v", difficulty: 1 },
    { id: 143, word: "perdere", meaning: "丢失", pos: "v", difficulty: 1 },
    { id: 144, word: "dimenticare", meaning: "忘记", pos: "v", difficulty: 1 },
    { id: 145, word: "ricordare", meaning: "记住", pos: "v", difficulty: 1 },
    { id: 146, word: "pensare", meaning: "想", pos: "v", difficulty: 1 },
    { id: 147, word: "credere", meaning: "相信", pos: "v", difficulty: 1 },
    { id: 148, word: "sperare", meaning: "希望", pos: "v", difficulty: 1 },
    { id: 149, word: "volere", meaning: "想要", pos: "v", difficulty: 1 },
    { id: 150, word: "dovere", meaning: "必须", pos: "v", difficulty: 1 },
    { id: 151, word: "potere", meaning: "能够", pos: "v", difficulty: 1 },
    { id: 152, word: "piacere", meaning: "喜欢", pos: "v", difficulty: 1 },
    { id: 153, word: "odiare", meaning: "讨厌", pos: "v", difficulty: 1 },
    { id: 154, word: "preferire", meaning: "更喜欢", pos: "v", difficulty: 1 },
    { id: 155, word: "scegliere", meaning: "选择", pos: "v", difficulty: 1 },
    { id: 156, word: "decidere", meaning: "决定", pos: "v", difficulty: 1 },
    { id: 157, word: "provare", meaning: "尝试", pos: "v", difficulty: 1 },
    { id: 158, word: "riuscire", meaning: "成功", pos: "v", difficulty: 1 },
    { id: 159, word: "fallire", meaning: "失败", pos: "v", difficulty: 1 },
    { id: 160, word: "vincere", meaning: "赢", pos: "v", difficulty: 1 }
  ],
  3: [
    // 旅行必备
    { id: 201, word: "viaggio", meaning: "旅行", pos: "n", difficulty: 1 },
    { id: 202, word: "viaggiare", meaning: "旅行", pos: "v", difficulty: 1 },
    { id: 203, word: "turista", meaning: "游客", pos: "n", difficulty: 1 },
    { id: 204, word: "aeroporto", meaning: "机场", pos: "n", difficulty: 1 },
    { id: 205, word: "aereo", meaning: "飞机", pos: "n", difficulty: 1 },
    { id: 206, word: "treno", meaning: "火车", pos: "n", difficulty: 1 },
    { id: 207, word: "stazione", meaning: "车站", pos: "n", difficulty: 1 },
    { id: 208, word: "autobus", meaning: "公交车", pos: "n", difficulty: 1 },
    { id: 209, word: "taxi", meaning: "出租车", pos: "n", difficulty: 1 },
    { id: 210, word: "hotel", meaning: "酒店", pos: "n", difficulty: 1 },
    { id: 211, word: "albergo", meaning: "酒店", pos: "n", difficulty: 1 },
    { id: 212, word: "pensione", meaning: "旅馆", pos: "n", difficulty: 1 },
    { id: 213, word: "camera", meaning: "房间", pos: "n", difficulty: 1 },
    { id: 214, word: "letto", meaning: "床", pos: "n", difficulty: 1 },
    { id: 215, word: "bagno", meaning: "浴室", pos: "n", difficulty: 1 },
    { id: 216, word: "prenotazione", meaning: "预订", pos: "n", difficulty: 1 },
    { id: 217, word: "prenotare", meaning: "预订", pos: "v", difficulty: 1 },
    { id: 218, word: "passaporto", meaning: "护照", pos: "n", difficulty: 1 },
    { id: 219, word: "visto", meaning: "签证", pos: "n", difficulty: 1 },
    { id: 220, word: "biglietto", meaning: "票", pos: "n", difficulty: 1 },
    { id: 221, word: "posto", meaning: "座位", pos: "n", difficulty: 1 },
    { id: 222, word: "valigia", meaning: "行李箱", pos: "n", difficulty: 1 },
    { id: 223, word: "bagaglio", meaning: "行李", pos: "n", difficulty: 1 },
    { id: 224, word: "mappa", meaning: "地图", pos: "n", difficulty: 1 },
    { id: 225, word: "guida", meaning: "导游/指南", pos: "n", difficulty: 1 },
    { id: 226, word: "museo", meaning: "博物馆", pos: "n", difficulty: 1 },
    { id: 227, word: "chiesa", meaning: "教堂", pos: "n", difficulty: 1 },
    { id: 228, word: "monumento", meaning: "纪念碑", pos: "n", difficulty: 1 },
    { id: 229, word: "piazza", meaning: "广场", pos: "n", difficulty: 1 },
    { id: 230, word: "fontana", meaning: "喷泉", pos: "n", difficulty: 1 },
    { id: 231, word: "parco", meaning: "公园", pos: "n", difficulty: 1 },
    { id: 232, word: "mare", meaning: "海", pos: "n", difficulty: 1 },
    { id: 233, word: "spiaggia", meaning: "海滩", pos: "n", difficulty: 1 },
    { id: 234, word: "montagna", meaning: "山", pos: "n", difficulty: 1 },
    { id: 235, word: "lago", meaning: "湖", pos: "n", difficulty: 1 },
    { id: 236, word: "fiume", meaning: "河", pos: "n", difficulty: 1 },
    { id: 237, word: "ponte", meaning: "桥", pos: "n", difficulty: 1 },
    { id: 238, word: "isola", meaning: "岛", pos: "n", difficulty: 1 },
    { id: 239, word: "centro", meaning: "中心", pos: "n", difficulty: 1 },
    { id: 240, word: "periferia", meaning: "郊区", pos: "n", difficulty: 1 },
    { id: 241, word: "nord", meaning: "北", pos: "n", difficulty: 1 },
    { id: 242, word: "sud", meaning: "南", pos: "n", difficulty: 1 },
    { id: 243, word: "est", meaning: "东", pos: "n", difficulty: 1 },
    { id: 244, word: "ovest", meaning: "西", pos: "n", difficulty: 1 },
    { id: 245, word: "sinistra", meaning: "左", pos: "n", difficulty: 1 }
  ],
  4: [
    // 商务意语
    { id: 301, word: "lavoro", meaning: "工作", pos: "n", difficulty: 2 },
    { id: 302, word: "lavorare", meaning: "工作", pos: "v", difficulty: 2 },
    { id: 303, word: "ufficio", meaning: "办公室", pos: "n", difficulty: 2 },
    { id: 304, word: "azienda", meaning: "公司", pos: "n", difficulty: 2 },
    { id: 305, word: "ditta", meaning: "企业", pos: "n", difficulty: 2 },
    { id: 306, word: "società", meaning: "公司", pos: "n", difficulty: 2 },
    { id: 307, word: "direzione", meaning: "管理层", pos: "n", difficulty: 2 },
    { id: 308, word: "direttore", meaning: "总监", pos: "n", difficulty: 2 },
    { id: 309, word: "manager", meaning: "经理", pos: "n", difficulty: 2 },
    { id: 310, word: "impiegato", meaning: "员工", pos: "n", difficulty: 2 },
    { id: 311, word: "collega", meaning: "同事", pos: "n", difficulty: 2 },
    { id: 312, word: "cliente", meaning: "客户", pos: "n", difficulty: 2 },
    { id: 313, word: "fornitore", meaning: "供应商", pos: "n", difficulty: 2 },
    { id: 314, word: "contratto", meaning: "合同", pos: "n", difficulty: 2 },
    { id: 315, word: "accordo", meaning: "协议", pos: "n", difficulty: 2 },
    { id: 316, word: "negoziazione", meaning: "谈判", pos: "n", difficulty: 2 },
    { id: 317, word: "negoziare", meaning: "谈判", pos: "v", difficulty: 2 },
    { id: 318, word: "vendita", meaning: "销售", pos: "n", difficulty: 2 },
    { id: 319, word: "acquisto", meaning: "采购", pos: "n", difficulty: 2 },
    { id: 320, word: "fattura", meaning: "发票", pos: "n", difficulty: 2 },
    { id: 321, word: "pagamento", meaning: "付款", pos: "n", difficulty: 2 },
    { id: 322, word: "pagare", meaning: "付款", pos: "v", difficulty: 2 },
    { id: 323, word: "conto", meaning: "账户", pos: "n", difficulty: 2 },
    { id: 324, word: "banca", meaning: "银行", pos: "n", difficulty: 2 },
    { id: 325, word: "investimento", meaning: "投资", pos: "n", difficulty: 2 },
    { id: 326, word: "investire", meaning: "投资", pos: "v", difficulty: 2 },
    { id: 327, word: "profitto", meaning: "利润", pos: "n", difficulty: 2 },
    { id: 328, word: "perdita", meaning: "损失", pos: "n", difficulty: 2 },
    { id: 329, word: "budget", meaning: "预算", pos: "n", difficulty: 2 },
    { id: 330, word: "progetto", meaning: "项目", pos: "n", difficulty: 2 },
    { id: 331, word: "presentazione", meaning: "演示", pos: "n", difficulty: 2 },
    { id: 332, word: "presentare", meaning: "展示", pos: "v", difficulty: 2 },
    { id: 333, word: "riunione", meaning: "会议", pos: "n", difficulty: 2 },
    { id: 334, word: "appuntamento", meaning: "约会", pos: "n", difficulty: 2 },
    { id: 335, word: "telefono", meaning: "电话", pos: "n", difficulty: 2 },
    { id: 336, word: "email", meaning: "邮件", pos: "n", difficulty: 2 },
    { id: 337, word: "internet", meaning: "互联网", pos: "n", difficulty: 2 },
    { id: 338, word: "sito", meaning: "网站", pos: "n", difficulty: 2 },
    { id: 339, word: "marketing", meaning: "营销", pos: "n", difficulty: 2 },
    { id: 340, word: "pubblicità", meaning: "广告", pos: "n", difficulty: 2 }
  ]
};
const STORAGE_KEYS = {
  CURRENT_BOOK: "current_book",
  USER_PROFILE: "user_profile",
  BOOK_PROGRESS: "book_progress_"
  // 会加上书籍ID
};
function getCurrentBook() {
  try {
    const bookId = common_vendor.index.getStorageSync(STORAGE_KEYS.CURRENT_BOOK) || 1;
    return bookList.find((book) => book.id === bookId) || bookList[0];
  } catch (e) {
    return bookList[0];
  }
}
function setCurrentBook(bookId) {
  try {
    common_vendor.index.setStorageSync(STORAGE_KEYS.CURRENT_BOOK, bookId);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:299", "设置当前书籍失败:", e);
  }
}
function getCurrentBookWords() {
  const currentBook = getCurrentBook();
  return bookWords[currentBook.id] || [];
}
function getBookProgress(bookId) {
  try {
    const progress = common_vendor.index.getStorageSync(STORAGE_KEYS.BOOK_PROGRESS + bookId) || {
      learnedWords: [],
      wrongWords: [],
      reviewWords: []
    };
    return progress;
  } catch (e) {
    return {
      learnedWords: [],
      wrongWords: [],
      reviewWords: []
    };
  }
}
function saveBookProgress(bookId, progress) {
  try {
    common_vendor.index.setStorageSync(STORAGE_KEYS.BOOK_PROGRESS + bookId, progress);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/bookData.js:332", "保存书籍进度失败:", e);
  }
}
function getCurrentBookWrongWords() {
  const currentBook = getCurrentBook();
  const progress = getBookProgress(currentBook.id);
  const bookWordList = getCurrentBookWords();
  return progress.wrongWords.map(
    (id) => bookWordList.find((word) => word.id === id)
  ).filter(Boolean);
}
function getCurrentBookLearnedWords() {
  const currentBook = getCurrentBook();
  const progress = getBookProgress(currentBook.id);
  const bookWordList = getCurrentBookWords();
  return progress.learnedWords.map(
    (id) => bookWordList.find((word) => word.id === id)
  ).filter(Boolean);
}
function addWrongWordToCurrentBook(wordId) {
  const currentBook = getCurrentBook();
  const progress = getBookProgress(currentBook.id);
  if (!progress.wrongWords.includes(wordId)) {
    progress.wrongWords.push(wordId);
    saveBookProgress(currentBook.id, progress);
  }
}
function removeWrongWordFromCurrentBook(wordId) {
  const currentBook = getCurrentBook();
  const progress = getBookProgress(currentBook.id);
  const index = progress.wrongWords.indexOf(wordId);
  if (index > -1) {
    progress.wrongWords.splice(index, 1);
    saveBookProgress(currentBook.id, progress);
  }
}
function addLearnedWordToCurrentBook(wordId) {
  const currentBook = getCurrentBook();
  const progress = getBookProgress(currentBook.id);
  if (!progress.learnedWords.includes(wordId)) {
    progress.learnedWords.push(wordId);
    saveBookProgress(currentBook.id, progress);
  }
}
function getRandomWordsForQuiz(count = 10) {
  const currentBookWords = getCurrentBookWords();
  const learnedWords = getCurrentBookLearnedWords();
  let availableWords = learnedWords.length >= count ? learnedWords : currentBookWords;
  const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
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
exports.posMap = posMap;
exports.removeWrongWordFromCurrentBook = removeWrongWordFromCurrentBook;
exports.saveBookProgress = saveBookProgress;
exports.setCurrentBook = setCurrentBook;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/bookData.js.map
