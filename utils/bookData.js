// utils/bookData.js - 基于45893完整词典的数据（后端API版本）

import { wordList, posMap, getWordsByPos, getWordsByDifficulty } from './wordData.js'
import userManager, { 
  isLoggedIn, 
  getUserData, 
  saveUserData, 
  addLearnedWord, 
  addWrongWord,
  getTempData,
  setTempData 
} from './userManager.js'

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

// 缓存机制
const cache = {
  userData: null,
  cacheTime: 0,
  cacheTimeout: 2 * 60 * 1000 // 2分钟缓存
}

// 清除缓存
function clearCache() {
  cache.userData = null
  cache.cacheTime = 0
}

// 获取用户数据（带缓存）
async function getCachedUserData() {
  if (!isLoggedIn()) {
    return null
  }

  const now = Date.now()
  if (cache.userData && (now - cache.cacheTime) < cache.cacheTimeout) {
    return cache.userData
  }

  try {
    const userData = await getUserData()
    cache.userData = userData
    cache.cacheTime = now
    return userData
  } catch (error) {
    console.error('获取用户数据失败:', error)
    return null
  }
}

// 获取当前学习的书籍
export async function getCurrentBook() {
  try {
    let currentBookId = 1 // 默认书籍ID
    
    if (isLoggedIn()) {
      // 登录用户从后端获取
      const userData = await getCachedUserData()
      if (userData && userData.current_book_id) {
        currentBookId = userData.current_book_id
      }
    } else {
      // 未登录用户使用临时存储
      currentBookId = getTempData('current_book_id', 1)
    }
    
    return bookList.find(book => book.id === currentBookId) || bookList[0]
  } catch (e) {
    console.error('获取当前书籍失败:', e)
    return bookList[0]
  }
}

// 设置当前学习的书籍
export async function setCurrentBook(bookId) {
  try {
    if (isLoggedIn()) {
      // 登录用户保存到后端
      const userData = await getCachedUserData() || {}
      userData.current_book_id = bookId
      await saveUserData(userData)
      clearCache() // 清除缓存，下次重新获取
    } else {
      // 未登录用户使用临时存储
      setTempData('current_book_id', bookId)
    }
  } catch (e) {
    console.error('设置当前书籍失败:', e)
  }
}

// 获取当前书籍的单词
export function getCurrentBookWords() {
  const currentBook = bookList[0] // 暂时只有一本书
  return bookWords[currentBook.id] || []
}

// 获取当前书籍的已学词汇
export async function getCurrentBookLearnedWords() {
  try {
    const currentBook = await getCurrentBook()
    const bookId = currentBook.id.toString()
    
    if (isLoggedIn()) {
      // 登录用户从后端获取
      const userData = await getCachedUserData()
      if (userData && userData.learned_words && userData.learned_words[bookId]) {
        const learnedWordIds = userData.learned_words[bookId]
        const bookWordsData = bookWords[currentBook.id] || []
        return learnedWordIds.map(id => bookWordsData.find(word => word.id === parseInt(id))).filter(Boolean)
      }
      return []
    } else {
      // 未登录用户从临时存储获取
      const learnedWordIds = getTempData(`learned_words_book_${bookId}`, [])
      const bookWordsData = bookWords[currentBook.id] || []
      return learnedWordIds.map(id => bookWordsData.find(word => word.id === id)).filter(Boolean)
    }
  } catch (e) {
    console.error('获取已学词汇失败:', e)
    return []
  }
}

// 获取当前书籍的错题
export async function getCurrentBookWrongWords() {
  try {
    const currentBook = await getCurrentBook()
    const bookId = currentBook.id.toString()
    
    if (isLoggedIn()) {
      // 登录用户从后端获取
      const userData = await getCachedUserData()
      if (userData && userData.wrong_words && userData.wrong_words[bookId]) {
        const wrongWordIds = userData.wrong_words[bookId]
        const bookWordsData = bookWords[currentBook.id] || []
        return wrongWordIds.map(id => bookWordsData.find(word => word.id === parseInt(id))).filter(Boolean)
      }
      return []
    } else {
      // 未登录用户从临时存储获取
      const wrongWordIds = getTempData(`wrong_words_book_${bookId}`, [])
      const bookWordsData = bookWords[currentBook.id] || []
      return wrongWordIds.map(id => bookWordsData.find(word => word.id === id)).filter(Boolean)
    }
  } catch (e) {
    console.error('获取错题失败:', e)
    return []
  }
}

// 添加已学词汇到当前书籍
export async function addLearnedWordToCurrentBook(wordId) {
  try {
    const currentBook = await getCurrentBook()
    const bookId = currentBook.id.toString()
    
    if (isLoggedIn()) {
      // 登录用户保存到后端
      await addLearnedWord(bookId, wordId)
      clearCache() // 清除缓存
    } else {
      // 未登录用户保存到临时存储
      const learnedWordIds = getTempData(`learned_words_book_${bookId}`, [])
      if (!learnedWordIds.includes(wordId)) {
        learnedWordIds.push(wordId)
        setTempData(`learned_words_book_${bookId}`, learnedWordIds)
      }
    }
    // 清除统计缓存，确保数据一致性
    clearStatsCache()
  } catch (e) {
    console.error('添加已学词汇失败:', e)
  }
}

// 添加错题到当前书籍
export async function addWrongWordToCurrentBook(wordId) {
  try {
    const currentBook = await getCurrentBook()
    const bookId = currentBook.id.toString()
    
    if (isLoggedIn()) {
      // 登录用户保存到后端
      await addWrongWord(bookId, wordId)
      clearCache() // 清除缓存
    } else {
      // 未登录用户保存到临时存储
      const wrongWordIds = getTempData(`wrong_words_book_${bookId}`, [])
      if (!wrongWordIds.includes(wordId)) {
        wrongWordIds.push(wordId)
        setTempData(`wrong_words_book_${bookId}`, wrongWordIds)
      }
    }
    // 清除统计缓存，确保数据一致性
    clearStatsCache()
  } catch (e) {
    console.error('添加错题失败:', e)
  }
}

// 移除当前书籍的错题
export async function removeWrongWordFromCurrentBook(wordId) {
  try {
    const currentBook = await getCurrentBook()
    const bookId = currentBook.id.toString()
    
    if (isLoggedIn()) {
      // 登录用户：从后端更新
      const userData = await getCachedUserData() || {}
      if (!userData.wrong_words) userData.wrong_words = {}
      if (!userData.wrong_words[bookId]) userData.wrong_words[bookId] = []
      
      const index = userData.wrong_words[bookId].indexOf(wordId.toString())
      if (index > -1) {
        userData.wrong_words[bookId].splice(index, 1)
        await saveUserData(userData)
        clearCache() // 清除缓存
      }
    } else {
      // 未登录用户：从临时存储移除
      const wrongWordIds = getTempData(`wrong_words_book_${bookId}`, [])
      const index = wrongWordIds.indexOf(wordId)
      if (index > -1) {
        wrongWordIds.splice(index, 1)
        setTempData(`wrong_words_book_${bookId}`, wrongWordIds)
      }
    }
    // 清除统计缓存，确保数据一致性
    clearStatsCache()
  } catch (e) {
    console.error('移除错题失败:', e)
  }
}

// 移除已学词汇
export async function removeLearnedWordFromCurrentBook(wordId) {
  try {
    const currentBook = await getCurrentBook()
    const bookId = currentBook.id.toString()
    
    if (isLoggedIn()) {
      // 登录用户：从后端更新
      const userData = await getCachedUserData() || {}
      if (!userData.learned_words) userData.learned_words = {}
      if (!userData.learned_words[bookId]) userData.learned_words[bookId] = []
      
      const index = userData.learned_words[bookId].indexOf(wordId.toString())
      if (index > -1) {
        userData.learned_words[bookId].splice(index, 1)
        await saveUserData(userData)
        clearCache() // 清除缓存
      }
    } else {
      // 未登录用户：从临时存储移除
      const learnedWordIds = getTempData(`learned_words_book_${bookId}`, [])
      const index = learnedWordIds.indexOf(wordId)
      if (index > -1) {
        learnedWordIds.splice(index, 1)
        setTempData(`learned_words_book_${bookId}`, learnedWordIds)
      }
    }
    // 清除统计缓存，确保数据一致性
    clearStatsCache()
  } catch (e) {
    console.error('移除已学词汇失败:', e)
  }
}

// 异步版本的函数（为了兼容性）
export async function getCurrentBookLearnedWordsAsync() {
  return await getCurrentBookLearnedWords()
}

export async function getCurrentBookWrongWordsAsync() {
  return await getCurrentBookWrongWords()
}

export async function getCurrentBookWordsAsync() {
  return new Promise((resolve) => {
    try {
      const words = getCurrentBookWords()
      setTimeout(() => resolve(words), 0)
    } catch (e) {
      resolve([])
    }
  })
}

// 带缓存的统计数据
let _statsCache = {
  learnedWords: null,
  wrongWords: null,
  lastUpdate: 0,
  cacheTimeout: 5000 // 5秒缓存
}

// 清除统计缓存
export function clearStatsCache() {
  _statsCache.learnedWords = null
  _statsCache.wrongWords = null
  _statsCache.lastUpdate = 0
}

// 带缓存的函数（为了兼容性和性能）
export async function getCurrentBookLearnedWordsWithCache() {
  const now = Date.now()
  if (_statsCache.learnedWords && (now - _statsCache.lastUpdate) < _statsCache.cacheTimeout) {
    return _statsCache.learnedWords
  }
  
  const result = await getCurrentBookLearnedWordsAsync()
  _statsCache.learnedWords = result
  _statsCache.lastUpdate = now
  return result
}

export async function getCurrentBookWrongWordsWithCache() {
  const now = Date.now()
  if (_statsCache.wrongWords && (now - _statsCache.lastUpdate) < _statsCache.cacheTimeout) {
    return _statsCache.wrongWords
  }
  
  const result = await getCurrentBookWrongWordsAsync()
  _statsCache.wrongWords = result
  _statsCache.lastUpdate = now
  return result
}

export async function getCurrentBookWordsWithCache() {
  return await getCurrentBookWordsAsync()
}

// 获取书籍学习进度
export async function getBookProgress(bookId) {
  try {
    const learnedWords = await getCurrentBookLearnedWords()
    const total = bookWords[bookId] ? bookWords[bookId].length : 0
    const learned = learnedWords.length
    
    return {
      learned,
      total,
      percentage: total > 0 ? Math.round((learned / total) * 100) : 0
    }
  } catch (e) {
    return {
      learned: 0,
      total: bookWords[bookId] ? bookWords[bookId].length : 0,
      percentage: 0
    }
  }
}

// 保存书籍学习进度
export async function saveBookProgress(bookId, progress) {
  try {
    // 在我们的系统中，进度是通过已学词汇自动计算的
    // 这个函数保持兼容性，但实际上数据已经通过单词学习状态保存了
    console.log(`保存书籍 ${bookId} 进度:`, progress)
    return true
  } catch (error) {
    console.error('保存书籍进度失败:', error)
    return false
  }
}

// 搜索当前书籍中的词汇
export function searchCurrentBookWords(query) {
  if (!query || query.length === 0) return []
  const currentBookWords = getCurrentBookWords()
  const searchQuery = query.toLowerCase()
  
  // 意大利语单词优先级：开头匹配 > 包含匹配
  const startsWithResults = []
  const containsResults = []
  
  // 中文含义优先级：开头匹配 > 包含匹配
  const meaningStartsResults = []
  const meaningContainsResults = []
  
  currentBookWords.forEach(word => {
    const italianWord = word.word.toLowerCase()
    const chineseMeaning = word.meaning || ''
    
    // 意大利语单词匹配
    if (italianWord.startsWith(searchQuery)) {
      startsWithResults.push(word)
    } else if (italianWord.includes(searchQuery)) {
      containsResults.push(word)
    }
    // 中文含义匹配
    else if (chineseMeaning.startsWith(query)) {
      meaningStartsResults.push(word)
    } else if (chineseMeaning.includes(query)) {
      meaningContainsResults.push(word)
    }
  })
  
  // 按优先级排序返回结果
  return [
    ...startsWithResults,
    ...containsResults,
    ...meaningStartsResults,
    ...meaningContainsResults
  ].slice(0, 50) // 限制返回50个结果
}

// 只查询，不影响学习进度的搜索
export function searchWordOnly(query) {
  return searchCurrentBookWords(query)
}

// 获取完整单词详情（仅查询，不记录学习）
export function getFullWordDetail(wordId) {
  const currentBookWords = getCurrentBookWords()
  const word = currentBookWords.find(w => w.id === wordId)
  
  if (!word) return null
  
  return {
    ...word,
    // 确保包含所有字段
    meanings: word.meanings || [word.meaning],
    examples: word.examples || [],
    fullContent: word.fullContent || word.meaning
  }
}

// 只获取单词详情，不记录学习进度
export function getWordDetailOnly(wordId) {
  return getFullWordDetail(wordId)
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

// 获取学习建议
export async function getStudyRecommendation() {
  try {
    const currentBookWords = getCurrentBookWords()
    const learnedWords = await getCurrentBookLearnedWords()
    const wrongWords = await getCurrentBookWrongWords()
    
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
  } catch (e) {
    console.error('获取学习建议失败:', e)
    return {
      type: 'start',
      title: '开始学习',
      description: '开始您的意大利语学习之旅',
      action: '开始学习'
    }
  }
}

// 获取学习统计
export async function getStudyStats() {
  try {
    const learnedWords = await getCurrentBookLearnedWords()
    const wrongWords = await getCurrentBookWrongWords()
    const currentBookWords = getCurrentBookWords()
    
    return {
      totalWords: currentBookWords.length,
      learnedWords: learnedWords.length,
      wrongWords: wrongWords.length,
      progress: currentBookWords.length > 0 ? 
        Math.round((learnedWords.length / currentBookWords.length) * 100) : 0
    }
  } catch (e) {
    console.error('获取学习统计失败:', e)
    return {
      totalWords: 0,
      learnedWords: 0,
      wrongWords: 0,
      progress: 0
    }
  }
}

// 显示登录提示（如果用户使用了临时数据）
export function showLoginPromptIfNeeded() {
  if (!isLoggedIn()) {
    // 检查是否有临时学习数据
    const hasLearningData = getTempData('learned_words_book_1', []).length > 0 ||
                           getTempData('wrong_words_book_1', []).length > 0
    
    if (hasLearningData) {
      uni.showModal({
        title: '学习进度提醒',
        content: '您的学习进度目前只保存在本地。登录后可以将数据同步到云端，确保不会丢失。',
        confirmText: '立即登录',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  }
} 