// utils/bookData.js - 基于45893完整词典的数据

import { wordList, posMap, getWordsByPos, getWordsByDifficulty } from './wordData.js'

// 书籍数据 - 只有一本完整的词典
export const bookList = [
  {
    id: 1,
    title: '意大利语词典',
    subtitle: '45893完整词典',
    cover: '📖',
    description: '包含44592个词汇的完整意大利语-中文词典，权威全面',
    difficulty: '全部',
    wordCount: wordList.length,
    color: '#6c5ce7'
  }
]

// 书籍的单词数据 - 只有完整词典
export const bookWords = {
  1: wordList  // 全部词汇
}

// 获取当前学习的书籍
export function getCurrentBook() {
  try {
    const currentBookId = uni.getStorageSync('current_book_id') || 1
    return bookList.find(book => book.id === currentBookId) || bookList[0]
  } catch (e) {
    return bookList[0]
  }
}

// 设置当前学习的书籍
export function setCurrentBook(bookId) {
  try {
    uni.setStorageSync('current_book_id', bookId)
  } catch (e) {
    console.error('设置当前书籍失败:', e)
  }
}

// 获取当前书籍的单词
export function getCurrentBookWords() {
  const currentBook = getCurrentBook()
  return bookWords[currentBook.id] || []
}

// 获取书籍学习进度
export function getBookProgress(bookId) {
  try {
    const progressKey = `book_progress_${bookId}`
    const progress = uni.getStorageSync(progressKey) || {
      learned: 0,
      total: bookWords[bookId] ? bookWords[bookId].length : 0,
      percentage: 0
    }
    return progress
  } catch (e) {
    return {
      learned: 0,
      total: bookWords[bookId] ? bookWords[bookId].length : 0,
      percentage: 0
    }
  }
}

// 保存书籍学习进度
export function saveBookProgress(bookId, progress) {
  try {
    const progressKey = `book_progress_${bookId}`
    uni.setStorageSync(progressKey, progress)
  } catch (e) {
    console.error('保存书籍进度失败:', e)
  }
}

// 获取当前书籍的错题
export function getCurrentBookWrongWords() {
  const currentBook = getCurrentBook()
  try {
    const wrongWordsKey = `wrong_words_book_${currentBook.id}`
    const wrongWordIds = uni.getStorageSync(wrongWordsKey) || []
    const bookWordsData = bookWords[currentBook.id] || []
    return wrongWordIds.map(id => bookWordsData.find(word => word.id === id)).filter(Boolean)
  } catch (e) {
    return []
  }
}

// 获取当前书籍的已学词汇
export function getCurrentBookLearnedWords() {
  const currentBook = getCurrentBook()
  try {
    const learnedWordsKey = `learned_words_book_${currentBook.id}`
    const learnedWordIds = uni.getStorageSync(learnedWordsKey) || []
    const bookWordsData = bookWords[currentBook.id] || []
    return learnedWordIds.map(id => bookWordsData.find(word => word.id === id)).filter(Boolean)
  } catch (e) {
    return []
  }
}

// 添加错题到当前书籍
export function addWrongWordToCurrentBook(wordId) {
  const currentBook = getCurrentBook()
  try {
    const wrongWordsKey = `wrong_words_book_${currentBook.id}`
    const wrongWordIds = uni.getStorageSync(wrongWordsKey) || []
    if (!wrongWordIds.includes(wordId)) {
      wrongWordIds.push(wordId)
      uni.setStorageSync(wrongWordsKey, wrongWordIds)
    }
  } catch (e) {
    console.error('添加错题失败:', e)
  }
}

// 移除当前书籍的错题
export function removeWrongWordFromCurrentBook(wordId) {
  const currentBook = getCurrentBook()
  try {
    const wrongWordsKey = `wrong_words_book_${currentBook.id}`
    const wrongWordIds = uni.getStorageSync(wrongWordsKey) || []
    const index = wrongWordIds.indexOf(wordId)
    if (index > -1) {
      wrongWordIds.splice(index, 1)
      uni.setStorageSync(wrongWordsKey, wrongWordIds)
    }
  } catch (e) {
    console.error('移除错题失败:', e)
  }
}

// 添加已学词汇到当前书籍
export function addLearnedWordToCurrentBook(wordId) {
  const currentBook = getCurrentBook()
  try {
    const learnedWordsKey = `learned_words_book_${currentBook.id}`
    const learnedWordIds = uni.getStorageSync(learnedWordsKey) || []
    if (!learnedWordIds.includes(wordId)) {
      learnedWordIds.push(wordId)
      uni.setStorageSync(learnedWordsKey, learnedWordIds)
    }
  } catch (e) {
    console.error('添加已学词汇失败:', e)
  }
}

// 从当前书籍中获取随机词汇用于测验
export function getRandomWordsForQuiz(count = 10) {
  const currentBookWords = getCurrentBookWords()
  if (currentBookWords.length === 0) return []
  
  const shuffled = [...currentBookWords].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// 根据词性筛选当前书籍的词汇
export function getCurrentBookWordsByPos(pos) {
  const currentBookWords = getCurrentBookWords()
  return currentBookWords.filter(word => word.pos === pos)
}

// 搜索当前书籍中的词汇
export function searchCurrentBookWords(query) {
  if (!query || query.length === 0) return []
  const currentBookWords = getCurrentBookWords()
  const searchQuery = query.toLowerCase()
  return currentBookWords.filter(word => 
    word.word.toLowerCase().includes(searchQuery) || 
    word.meaning.includes(query)
  )
}

// 获取词性统计
export function getWordsPosStats() {
  const currentBookWords = getCurrentBookWords()
  const stats = {}
  
  currentBookWords.forEach(word => {
    const posName = posMap[word.pos] || word.pos
    stats[posName] = (stats[posName] || 0) + 1
  })
  
  return stats
}

// 获取学习建议
export function getStudyRecommendation() {
  const currentBookWords = getCurrentBookWords()
  const learnedWords = getCurrentBookLearnedWords()
  const wrongWords = getCurrentBookWrongWords()
  
  const total = currentBookWords.length
  const learned = learnedWords.length
  const wrong = wrongWords.length
  
  if (learned === 0) {
    return {
      type: 'start',
      title: '开始学习',
      description: '建议从基础词汇开始学习',
      action: '开始学习'
    }
  }
  
  if (wrong > 0) {
    return {
      type: 'review',
      title: '复习错题',
      description: `您有 ${wrong} 个词汇需要复习`,
      action: '复习错题'
    }
  }
  
  if (learned / total < 0.8) {
    return {
      type: 'continue',
      title: '继续学习',
      description: `已学习 ${learned}/${total} 个词汇`,
      action: '继续学习'
    }
  }
  
  return {
    type: 'complete',
    title: '学习完成',
    description: '恭喜您完成了词典的学习！',
    action: '继续复习'
  }
}

// 获取词汇分页数据（用于大量词汇的展示）
export function getWordsByPage(page = 1, pageSize = 20) {
  const currentBookWords = getCurrentBookWords()
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    words: currentBookWords.slice(start, end),
    total: currentBookWords.length,
    page,
    pageSize,
    totalPages: Math.ceil(currentBookWords.length / pageSize)
  }
}

// 获取词典统计信息
export function getDictionaryStats() {
  const currentBookWords = getCurrentBookWords()
  const learnedWords = getCurrentBookLearnedWords()
  const wrongWords = getCurrentBookWrongWords()
  
  // 词性统计
  const posStats = getWordsPosStats()
  
  // 学习进度统计
  const progressStats = {
    total: currentBookWords.length,
    learned: learnedWords.length,
    wrong: wrongWords.length,
    remaining: currentBookWords.length - learnedWords.length,
    percentage: Math.round((learnedWords.length / currentBookWords.length) * 100)
  }
  
  return {
    posStats,
    progressStats
  }
}

// 获取推荐学习的词汇（基于词性和学习进度）
export function getRecommendedWords(count = 20) {
  const currentBookWords = getCurrentBookWords()
  const learnedWordIds = getCurrentBookLearnedWords().map(w => w.id)
  const wrongWordIds = getCurrentBookWrongWords().map(w => w.id)
  
  // 优先推荐错题
  const unlearnedWords = currentBookWords.filter(word => 
    !learnedWordIds.includes(word.id)
  )
  
  // 如果有错题，优先返回错题
  if (wrongWordIds.length > 0) {
    const wrongWords = currentBookWords.filter(word => wrongWordIds.includes(word.id))
    return wrongWords.slice(0, count)
  }
  
  // 否则返回未学习的词汇
  return unlearnedWords.slice(0, count)
}

export { posMap } 

// 异步获取当前书籍的已学词汇
export async function getCurrentBookLearnedWordsAsync() {
  return new Promise((resolve) => {
    try {
      const currentBook = getCurrentBook()
      const learnedWordsKey = `learned_words_book_${currentBook.id}`
      const learnedWordIds = uni.getStorageSync(learnedWordsKey) || []
      const bookWordsData = bookWords[currentBook.id] || []
      
      // 分批处理大量数据，避免阻塞
      const batchSize = 1000
      const results = []
      
      const processBatch = (index) => {
        if (index >= learnedWordIds.length) {
          resolve(results)
          return
        }
        
        const batch = learnedWordIds.slice(index, index + batchSize)
        const batchWords = batch.map(id => bookWordsData.find(word => word.id === id)).filter(Boolean)
        results.push(...batchWords)
        
        // 使用setTimeout让出执行权，避免阻塞UI
        setTimeout(() => processBatch(index + batchSize), 0)
      }
      
      processBatch(0)
    } catch (e) {
      console.error('获取已学词汇失败:', e)
      resolve([])
    }
  })
}

// 异步获取当前书籍的错题
export async function getCurrentBookWrongWordsAsync() {
  return new Promise((resolve) => {
    try {
      const currentBook = getCurrentBook()
      const wrongWordsKey = `wrong_words_book_${currentBook.id}`
      const wrongWordIds = uni.getStorageSync(wrongWordsKey) || []
      const bookWordsData = bookWords[currentBook.id] || []
      
      // 分批处理大量数据，避免阻塞
      const batchSize = 1000
      const results = []
      
      const processBatch = (index) => {
        if (index >= wrongWordIds.length) {
          resolve(results)
          return
        }
        
        const batch = wrongWordIds.slice(index, index + batchSize)
        const batchWords = batch.map(id => bookWordsData.find(word => word.id === id)).filter(Boolean)
        results.push(...batchWords)
        
        // 使用setTimeout让出执行权，避免阻塞UI
        setTimeout(() => processBatch(index + batchSize), 0)
      }
      
      processBatch(0)
    } catch (e) {
      console.error('获取错题失败:', e)
      resolve([])
    }
  })
} 

// 缓存优化 - 避免重复计算
const cache = {
  learnedWords: null,
  wrongWords: null,
  allWords: null,
  cacheTime: 0,
  cacheTimeout: 5 * 60 * 1000 // 5分钟缓存
}

// 带缓存的获取已学词汇
export async function getCurrentBookLearnedWordsWithCache() {
  const now = Date.now()
  if (cache.learnedWords && (now - cache.cacheTime) < cache.cacheTimeout) {
    return cache.learnedWords
  }
  
  const words = await getCurrentBookLearnedWordsAsync()
  cache.learnedWords = words
  cache.cacheTime = now
  return words
}

// 带缓存的获取所有单词
export async function getCurrentBookWordsWithCache() {
  const now = Date.now()
  if (cache.allWords && (now - cache.cacheTime) < cache.cacheTimeout) {
    return cache.allWords
  }
  
  return new Promise((resolve) => {
    try {
      // 使用异步处理避免阻塞UI
      setTimeout(() => {
        const words = getCurrentBookWords()
        cache.allWords = words
        cache.cacheTime = now
        resolve(words)
      }, 0)
    } catch (e) {
      console.error('获取所有单词失败:', e)
      resolve([])
    }
  })
}

// 带缓存的获取错误单词
export async function getCurrentBookWrongWordsWithCache() {
  const now = Date.now()
  if (cache.wrongWords && (now - cache.cacheTime) < cache.cacheTimeout) {
    return cache.wrongWords
  }
  
  const words = await getCurrentBookWrongWordsAsync()
  cache.wrongWords = words
  cache.cacheTime = now
  return words
}

// 分批获取所有单词（用于大量数据的渐进式加载）
export async function getCurrentBookWordsBatch(batchSize = 2000) {
  const allWords = await getCurrentBookWordsWithCache()
  const batches = []
  
  for (let i = 0; i < allWords.length; i += batchSize) {
    batches.push(allWords.slice(i, i + batchSize))
  }
  
  return {
    total: allWords.length,
    batches: batches,
    batchCount: batches.length
  }
}

// 懒加载获取词汇（分页）
export async function getCurrentBookWordsLazy(page = 1, pageSize = 100) {
  return new Promise((resolve) => {
    try {
      const currentBookWords = getCurrentBookWords()
      const start = (page - 1) * pageSize
      const end = start + pageSize
      
      // 使用setTimeout避免阻塞
      setTimeout(() => {
        resolve({
          words: currentBookWords.slice(start, end),
          total: currentBookWords.length,
          page,
          hasMore: end < currentBookWords.length
        })
      }, 0)
    } catch (e) {
      resolve({ words: [], total: 0, page, hasMore: false })
    }
  })
}

// 清除缓存
export function clearCache() {
  cache.learnedWords = null
  cache.wrongWords = null
  cache.allWords = null
  cache.cacheTime = 0
} 

// 从当前书籍中移除已学词汇
export function removeLearnedWordFromCurrentBook(wordId) {
  const currentBook = getCurrentBook()
  try {
    const learnedWordsKey = `learned_words_book_${currentBook.id}`
    const learnedWordIds = uni.getStorageSync(learnedWordsKey) || []
    const index = learnedWordIds.indexOf(wordId)
    if (index > -1) {
      learnedWordIds.splice(index, 1)
      uni.setStorageSync(learnedWordsKey, learnedWordIds)
      // 清除缓存
      clearCache()
    }
  } catch (e) {
    console.error('移除已学词汇失败:', e)
  }
}

// 异步获取当前书籍的所有词汇
export async function getCurrentBookWordsAsync() {
  return new Promise((resolve) => {
    try {
      const currentBookWords = getCurrentBookWords()
      
      // 分批处理大量数据，避免阻塞
      const batchSize = 2000
      const results = []
      
      const processBatch = (index) => {
        if (index >= currentBookWords.length) {
          resolve(results)
          return
        }
        
        const batch = currentBookWords.slice(index, index + batchSize)
        results.push(...batch)
        
        // 使用setTimeout让出执行权，避免阻塞UI
        setTimeout(() => processBatch(index + batchSize), 0)
      }
      
      processBatch(0)
    } catch (e) {
      console.error('获取当前书籍词汇失败:', e)
      resolve([])
    }
  })
}

// 查词功能（不影响学习状态）- 精确匹配开头
export function searchWordOnly(query) {
  if (!query || query.length === 0) return []
  const currentBookWords = getCurrentBookWords()
  const searchQuery = query.toLowerCase()
  
  return currentBookWords.filter(word => {
    // 优先匹配意大利语单词开头
    const wordStartsWithQuery = word.word.toLowerCase().startsWith(searchQuery)
    // 其次匹配中文意思的开头
    const meaningStartsWithQuery = word.meaning.startsWith(query)
    // 最后匹配中文意思中包含的词（降低优先级）
    const meaningIncludes = word.meaning.includes(query) && query.length >= 2
    
    return wordStartsWithQuery || meaningStartsWithQuery || meaningIncludes
  }).sort((a, b) => {
    // 排序：意大利语开头 > 中文开头 > 中文包含
    const aWordStarts = a.word.toLowerCase().startsWith(searchQuery)
    const bWordStarts = b.word.toLowerCase().startsWith(searchQuery)
    const aMeaningStarts = a.meaning.startsWith(query)
    const bMeaningStarts = b.meaning.startsWith(query)
    
    if (aWordStarts && !bWordStarts) return -1
    if (!aWordStarts && bWordStarts) return 1
    if (aMeaningStarts && !bMeaningStarts) return -1
    if (!aMeaningStarts && bMeaningStarts) return 1
    
    return 0
  })
}

// 获取词汇详情（不影响学习状态）
export function getWordDetailOnly(wordId) {
  const currentBookWords = getCurrentBookWords()
  return currentBookWords.find(word => word.id === wordId)
}

// 根据ID获取完整词汇详情（包含所有字段）
export function getFullWordDetail(wordId) {
  const currentBookWords = getCurrentBookWords()
  const word = currentBookWords.find(word => word.id == wordId)
  
  if (!word) return null
  
  // 返回除difficulty外的所有信息
  const { difficulty, ...fullDetail } = word
  return {
    ...fullDetail,
    meanings: word.meanings || [word.meaning],
    examples: word.examples || [],
    fullContent: word.fullContent || ''
  }
} 