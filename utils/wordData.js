// utils/wordData.js

// 词性映射
export const posMap = {
  'n': '名词',
  'v': '动词', 
  'adj': '形容词',
  'adv': '副词',
  'prep': '介词',
  'pron': '代词',
  'conj': '连词'
}

// 完整的单词数据库
export const wordList = [
  // 基础动词
  { id: 1, word: 'parlare', meaning: '说话', pos: 'v', difficulty: 1 },
  { id: 2, word: 'mangiare', meaning: '吃', pos: 'v', difficulty: 1 },
  { id: 3, word: 'bere', meaning: '喝', pos: 'v', difficulty: 1 },
  { id: 4, word: 'dormire', meaning: '睡觉', pos: 'v', difficulty: 1 },
  { id: 5, word: 'leggere', meaning: '读', pos: 'v', difficulty: 1 },
  { id: 6, word: 'scrivere', meaning: '写', pos: 'v', difficulty: 1 },
  { id: 7, word: 'camminare', meaning: '走路', pos: 'v', difficulty: 1 },
  { id: 8, word: 'correre', meaning: '跑', pos: 'v', difficulty: 1 },
  { id: 9, word: 'amare', meaning: '爱', pos: 'v', difficulty: 1 },
  { id: 10, word: 'lavorare', meaning: '工作', pos: 'v', difficulty: 1 },
  
  // 基础名词
  { id: 11, word: 'libro', meaning: '书', pos: 'n', difficulty: 1 },
  { id: 12, word: 'casa', meaning: '家', pos: 'n', difficulty: 1 },
  { id: 13, word: 'famiglia', meaning: '家庭', pos: 'n', difficulty: 1 },
  { id: 14, word: 'tempo', meaning: '时间', pos: 'n', difficulty: 1 },
  { id: 15, word: 'acqua', meaning: '水', pos: 'n', difficulty: 1 },
  { id: 16, word: 'pane', meaning: '面包', pos: 'n', difficulty: 1 },
  { id: 17, word: 'macchina', meaning: '汽车', pos: 'n', difficulty: 1 },
  { id: 18, word: 'scuola', meaning: '学校', pos: 'n', difficulty: 1 },
  { id: 19, word: 'amico', meaning: '朋友', pos: 'n', difficulty: 1 },
  { id: 20, word: 'giorno', meaning: '天', pos: 'n', difficulty: 1 },
  
  // 基础形容词
  { id: 21, word: 'bello', meaning: '美丽的', pos: 'adj', difficulty: 1 },
  { id: 22, word: 'buono', meaning: '好的', pos: 'adj', difficulty: 1 },
  { id: 23, word: 'grande', meaning: '大的', pos: 'adj', difficulty: 1 },
  { id: 24, word: 'piccolo', meaning: '小的', pos: 'adj', difficulty: 1 },
  { id: 25, word: 'nuovo', meaning: '新的', pos: 'adj', difficulty: 1 },
  { id: 26, word: 'vecchio', meaning: '老的', pos: 'adj', difficulty: 1 },
  { id: 27, word: 'felice', meaning: '开心的', pos: 'adj', difficulty: 1 },
  { id: 28, word: 'triste', meaning: '悲伤的', pos: 'adj', difficulty: 1 },
  { id: 29, word: 'facile', meaning: '容易的', pos: 'adj', difficulty: 1 },
  { id: 30, word: 'difficile', meaning: '困难的', pos: 'adj', difficulty: 1 },
  
  // 基础副词
  { id: 31, word: 'velocemente', meaning: '迅速地', pos: 'adv', difficulty: 1 },
  { id: 32, word: 'lentamente', meaning: '缓慢地', pos: 'adv', difficulty: 1 },
  { id: 33, word: 'bene', meaning: '好地', pos: 'adv', difficulty: 1 },
  { id: 34, word: 'male', meaning: '坏地', pos: 'adv', difficulty: 1 },
  { id: 35, word: 'sempre', meaning: '总是', pos: 'adv', difficulty: 1 },
  { id: 36, word: 'mai', meaning: '从不', pos: 'adv', difficulty: 1 },
  { id: 37, word: 'oggi', meaning: '今天', pos: 'adv', difficulty: 1 },
  { id: 38, word: 'ieri', meaning: '昨天', pos: 'adv', difficulty: 1 },
  { id: 39, word: 'domani', meaning: '明天', pos: 'adv', difficulty: 1 },
  { id: 40, word: 'molto', meaning: '很', pos: 'adv', difficulty: 1 },
  
  // 进阶词汇
  { id: 41, word: 'università', meaning: '大学', pos: 'n', difficulty: 2 },
  { id: 42, word: 'conoscenza', meaning: '知识', pos: 'n', difficulty: 2 },
  { id: 43, word: 'bellezza', meaning: '美丽', pos: 'n', difficulty: 2 },
  { id: 44, word: 'saggezza', meaning: '智慧', pos: 'n', difficulty: 2 },
  { id: 45, word: 'felicità', meaning: '幸福', pos: 'n', difficulty: 2 },
  { id: 46, word: 'intelligente', meaning: '聪明的', pos: 'adj', difficulty: 2 },
  { id: 47, word: 'interessante', meaning: '有趣的', pos: 'adj', difficulty: 2 },
  { id: 48, word: 'importante', meaning: '重要的', pos: 'adj', difficulty: 2 },
  { id: 49, word: 'necessario', meaning: '必要的', pos: 'adj', difficulty: 2 },
  { id: 50, word: 'possibile', meaning: '可能的', pos: 'adj', difficulty: 2 }
]

// 本地存储key
export const STORAGE_KEYS = {
  WRONG_WORDS: 'wrong_words',
  LEARNED_WORDS: 'learned_words',
  REVIEW_WORDS: 'review_words'
}

// 获取随机单词
export function getRandomWord(excludeIds = []) {
  const availableWords = wordList.filter(word => !excludeIds.includes(word.id))
  return availableWords[Math.floor(Math.random() * availableWords.length)]
}

// 获取错题
export function getWrongWords() {
  try {
    const wrongWords = uni.getStorageSync(STORAGE_KEYS.WRONG_WORDS) || []
    return wrongWords.map(id => wordList.find(word => word.id === id)).filter(Boolean)
  } catch (e) {
    return []
  }
}

// 添加错题
export function addWrongWord(wordId) {
  try {
    const wrongWords = uni.getStorageSync(STORAGE_KEYS.WRONG_WORDS) || []
    if (!wrongWords.includes(wordId)) {
      wrongWords.push(wordId)
      uni.setStorageSync(STORAGE_KEYS.WRONG_WORDS, wrongWords)
    }
  } catch (e) {
    console.error('保存错题失败:', e)
  }
}

// 移除错题
export function removeWrongWord(wordId) {
  try {
    const wrongWords = uni.getStorageSync(STORAGE_KEYS.WRONG_WORDS) || []
    const index = wrongWords.indexOf(wordId)
    if (index > -1) {
      wrongWords.splice(index, 1)
      uni.setStorageSync(STORAGE_KEYS.WRONG_WORDS, wrongWords)
    }
  } catch (e) {
    console.error('移除错题失败:', e)
  }
}

// 获取已学单词
export function getLearnedWords() {
  try {
    const learnedWords = uni.getStorageSync(STORAGE_KEYS.LEARNED_WORDS) || []
    return learnedWords.map(id => wordList.find(word => word.id === id)).filter(Boolean)
  } catch (e) {
    return []
  }
}

// 添加已学单词
export function addLearnedWord(wordId) {
  try {
    const learnedWords = uni.getStorageSync(STORAGE_KEYS.LEARNED_WORDS) || []
    if (!learnedWords.includes(wordId)) {
      learnedWords.push(wordId)
      uni.setStorageSync(STORAGE_KEYS.LEARNED_WORDS, learnedWords)
    }
  } catch (e) {
    console.error('保存已学单词失败:', e)
  }
}
