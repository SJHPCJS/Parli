// utils/parseDict.js - 解析45893词典文件的完整脚本

const fs = require('fs');
const path = require('path');

// 词性映射表
const posMap = {
  's.m.': 'n',      // 阳性名词
  's.f.': 'n',      // 阴性名词  
  'agg.': 'adj',    // 形容词
  'v.tr.': 'v',     // 及物动词
  'v.intr.': 'v',   // 不及物动词
  'v.rifl.': 'v',   // 反身动词
  'avv.': 'adv',    // 副词
  'prep.': 'prep',  // 介词
  'pron.': 'pron',  // 代词
  'conj.': 'conj',  // 连词
  'interj.': 'interj' // 感叹词
};

// 解析单个词条
function parseEntry(entry) {
  if (!entry || entry.trim().length === 0) return null;
  
  // 提取词头
  const fontMatch = entry.match(/<font size=5>([^<]+)<\/font>/);
  if (!fontMatch) return null;
  
  const word = fontMatch[1].trim();
  if (!word) return null;
  
  // 提取词性和释义
  let pos = 'n'; // 默认为名词
  let meaning = '';
  
  // 查找词性
  for (const [italianPos, englishPos] of Object.entries(posMap)) {
    if (entry.includes(italianPos)) {
      pos = englishPos;
      break;
    }
  }
  
  // 提取中文释义
  const cleanContent = entry
    .replace(/<[^>]*>/g, ' ')  // 去掉HTML标签
    .replace(/\\n/g, ' ')      // 去掉换行符
    .replace(/\s+/g, ' ')      // 合并多个空格
    .trim();
  
  // 寻找中文释义
  const chineseMatches = cleanContent.match(/[\u4e00-\u9fa5]{2,}/g);
  
  if (chineseMatches && chineseMatches.length > 0) {
    // 筛选出最合适的中文释义
    let bestMeaning = '';
    for (const match of chineseMatches) {
      // 排除一些常见的无用词汇
      if (match.length > 1 && !match.includes('世纪') && !match.includes('古代') && 
          !match.includes('符号') && !match.includes('单位') && match.length <= 20) {
        if (match.length > bestMeaning.length) {
          bestMeaning = match;
        }
      }
    }
    
    // 如果没有找到合适的，就用第一个
    if (!bestMeaning && chineseMatches.length > 0) {
      bestMeaning = chineseMatches[0];
    }
    
    meaning = bestMeaning;
  }
  
  // 如果释义太长，截断
  if (meaning.length > 30) {
    meaning = meaning.substring(0, 30) + '...';
  }
  
  if (!meaning || meaning.length < 2) {
    return null;
  }
  
  return {
    word,
    meaning,
    pos,
    difficulty: 1 // 默认难度
  };
}

// 解析整个词典文件
function parseDict(filePath) {
  console.log('开始解析45893完整词典文件...');
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 按font标签分割词条
  const entries = content.split(/(?=<font size=5>)/);
  
  console.log(`找到 ${entries.length} 个可能的词条`);
  
  const words = [];
  let id = 1;
  
  // 处理全部词条，不限制数量
  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i].trim();
    if (!entry) continue;
    
    const parsed = parseEntry(entry);
    if (parsed && parsed.word && parsed.meaning && parsed.word.length > 0) {
      words.push({
        id: id++,
        ...parsed
      });
    }
    
    if (i % 1000 === 0) {
      console.log(`已处理 ${i} 条词条，已找到 ${words.length} 个有效词条...`);
    }
  }
  
  console.log(`解析完成，共得到 ${words.length} 个有效词条`);
  
  // 输出统计信息
  const posStats = {};
  words.forEach(word => {
    posStats[word.pos] = (posStats[word.pos] || 0) + 1;
  });
  
  console.log('\n词性分布统计：');
  Object.entries(posStats).forEach(([pos, count]) => {
    const posName = {
      'n': '名词',
      'v': '动词',
      'adj': '形容词',
      'adv': '副词',
      'prep': '介词',
      'pron': '代词',
      'conj': '连词',
      'interj': '感叹词'
    }[pos] || pos;
    console.log(`${posName}: ${count} 个`);
  });
  
  // 输出前几个词条看看效果
  console.log('\n前10个解析结果：');
  words.slice(0, 10).forEach(word => {
    console.log(`${word.id}. ${word.word} (${word.pos}) - ${word.meaning}`);
  });
  
  return words;
}

// 生成词汇数据文件
function generateWordData(words) {
  const wordDataContent = `// utils/wordData.js - 基于45893完整词典的数据

// 词性映射
export const posMap = {
  'n': '名词',
  'v': '动词', 
  'adj': '形容词',
  'adv': '副词',
  'prep': '介词',
  'pron': '代词',
  'conj': '连词',
  'interj': '感叹词'
}

// 完整的单词数据库 - 来自45893完整词典
export const wordList = ${JSON.stringify(words, null, 2)}

// 本地存储key
export const STORAGE_KEYS = {
  WRONG_WORDS: 'wrong_words',
  LEARNED_WORDS: 'learned_words',
  REVIEW_WORDS: 'review_words'
}

// 获取随机单词
export function getRandomWord(excludeIds = []) {
  const availableWords = wordList.filter(word => !excludeIds.includes(word.id))
  if (availableWords.length === 0) return null
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
    console.error('添加错题失败:', e)
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

// 获取已学词汇
export function getLearnedWords() {
  try {
    const learnedWords = uni.getStorageSync(STORAGE_KEYS.LEARNED_WORDS) || []
    return learnedWords.map(id => wordList.find(word => word.id === id)).filter(Boolean)
  } catch (e) {
    return []
  }
}

// 添加已学词汇
export function addLearnedWord(wordId) {
  try {
    const learnedWords = uni.getStorageSync(STORAGE_KEYS.LEARNED_WORDS) || []
    if (!learnedWords.includes(wordId)) {
      learnedWords.push(wordId)
      uni.setStorageSync(STORAGE_KEYS.LEARNED_WORDS, learnedWords)
    }
  } catch (e) {
    console.error('添加已学词汇失败:', e)
  }
}

// 按词性分类获取单词
export function getWordsByPos(pos) {
  return wordList.filter(word => word.pos === pos)
}

// 按难度获取单词
export function getWordsByDifficulty(difficulty) {
  return wordList.filter(word => word.difficulty === difficulty)
}

// 搜索单词
export function searchWords(query) {
  if (!query || query.length === 0) return []
  const searchQuery = query.toLowerCase()
  return wordList.filter(word => 
    word.word.toLowerCase().includes(searchQuery) || 
    word.meaning.includes(query)
  )
}

// 获取词汇总数
export function getWordCount() {
  return wordList.length
}

// 获取指定范围的词汇
export function getWordsInRange(start, end) {
  return wordList.slice(start, end)
}

// 获取词性统计
export function getPosStatistics() {
  const stats = {}
  wordList.forEach(word => {
    const posName = posMap[word.pos] || word.pos
    stats[posName] = (stats[posName] || 0) + 1
  })
  return stats
}

// 分页获取词汇
export function getWordsByPage(page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    words: wordList.slice(start, end),
    total: wordList.length,
    page,
    pageSize,
    totalPages: Math.ceil(wordList.length / pageSize)
  }
}
`;

  return wordDataContent;
}

// 主函数
function main() {
  const dictPath = path.join(__dirname, '../books/45893.txt');
  
  if (!fs.existsSync(dictPath)) {
    console.error('词典文件不存在:', dictPath);
    return;
  }
  
  console.log('开始处理45893完整词典...');
  console.log('预计处理时间: 3-5分钟');
  
  // 解析词典
  const words = parseDict(dictPath);
  
  if (words.length === 0) {
    console.error('没有解析到有效词条！');
    return;
  }
  
  // 生成新的wordData.js文件
  const wordDataContent = generateWordData(words);
  const outputPath = path.join(__dirname, 'wordData.js');
  
  // 备份原文件
  if (fs.existsSync(outputPath)) {
    const backupPath = outputPath + '.backup.' + Date.now();
    fs.renameSync(outputPath, backupPath);
    console.log('原文件已备份为:', path.basename(backupPath));
  }
  
  // 写入新文件
  fs.writeFileSync(outputPath, wordDataContent);
  
  console.log('🎉 45893完整词典解析完成！');
  console.log(`📚 新的wordData.js已生成，包含 ${words.length} 个词条`);
  console.log(`📊 文件大小: ${(wordDataContent.length / 1024 / 1024).toFixed(2)} MB`);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseDict,
  generateWordData
}; 