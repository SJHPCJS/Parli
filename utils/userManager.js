// utils/userManager.js - 用户管理系统（后端API版本）

// API配置 - 生产环境公网部署
const API_CONFIG = {
  baseURL: 'http://39.105.232.242/api', // 生产环境公网IP
  // 开发环境备用配置：
  // baseURL: 'http://localhost:8080/api', // 本地开发
  // baseURL: 'http://192.168.1.12:8080/api', // 局域网测试
  timeout: 15000 // 15秒超时
}

// 存储键（仅用于临时数据和token）
const STORAGE_KEYS = {
  CURRENT_USER: 'parli_current_user',
  AUTH_TOKEN: 'parli_auth_token',
  TEMP_DATA_PREFIX: 'parli_temp_data_'
}

// 网络请求工具
class ApiClient {
  static async request(url, options = {}) {
    const fullUrl = `${API_CONFIG.baseURL}${url}`
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.timeout
    }
    
    const requestOptions = { ...defaultOptions, ...options }
    
    try {
      const response = await uni.request({
        url: fullUrl,
        method: requestOptions.method,
        data: requestOptions.body ? JSON.parse(requestOptions.body) : undefined,
        header: requestOptions.headers,
        timeout: requestOptions.timeout
      })
      
      // uni.request 直接返回结果对象
      if (response && response.statusCode === 200) {
        return {
          ok: true,
          status: response.statusCode,
          json: async () => response.data
        }
      } else if (response && response.statusCode) {
        throw new Error(`HTTP ${response.statusCode}: 网络请求失败`)
      } else {
        throw new Error('网络连接失败，无法连接到后端服务')
      }
    } catch (error) {
      console.error('API请求失败:', error)
      throw new Error(error.message || '网络连接失败，请检查后端服务是否启动')
    }
  }
  
  static async get(url) {
    return this.request(url)
  }
  
  static async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// 用户类
class User {
  constructor(userData) {
    this.userId = userData.user_id
    this.username = userData.username
    this.nickname = userData.nickname
    this.createdAt = userData.created_at
    this.lastLoginAt = userData.last_login_at
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      nickname: this.nickname,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    }
  }

  static fromJSON(data) {
    return new User({
      user_id: data.userId,
      username: data.username,
      nickname: data.nickname,
      created_at: data.createdAt,
      last_login_at: data.lastLoginAt
    })
  }
}

// 用户管理器
class UserManager {
  constructor() {
    this.currentUser = null
    this.authToken = null
    this.loadCurrentUser()
  }

  // 检查后端服务是否可用
  async checkBackendHealth() {
    try {
      const response = await ApiClient.get('/health')
      const data = await response.json()
      return data.status === 'healthy'
    } catch (error) {
      console.error('后端服务检查失败:', error)
      return false
    }
  }

  // 注册用户
  async register(username, password, nickname) {
    try {
      // 先检查后端是否可用
      const isBackendHealthy = await this.checkBackendHealth()
      if (!isBackendHealthy) {
        return { 
          success: false, 
          message: '无法连接到服务器，请确保后端服务已启动' 
        }
      }

      const response = await ApiClient.post('/register', {
        username,
        password,
        nickname
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        console.log('注册成功:', result.user)
      }
      
      return result
    } catch (error) {
      console.error('注册失败:', error)
      return { 
        success: false, 
        message: error.message || '注册失败，请检查网络连接' 
      }
    }
  }

  // 登录
  async login(username, password) {
    try {
      // 先检查后端是否可用
      const isBackendHealthy = await this.checkBackendHealth()
      if (!isBackendHealthy) {
        return { 
          success: false, 
          message: '无法连接到服务器，请确保后端服务已启动' 
        }
      }

      const response = await ApiClient.post('/login', {
        username,
        password
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // 保存用户信息和token
        this.authToken = result.token
        this.currentUser = new User(result.user)
        
        this.saveCurrentUser()
        this.saveAuthToken()
        
        console.log('登录成功:', this.currentUser.username)
      }
      
      return result
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.message || '登录失败，请检查网络连接' 
      }
    }
  }

  // 退出登录
  logout() {
    try {
      this.currentUser = null
      this.authToken = null
      
      uni.removeStorageSync(STORAGE_KEYS.CURRENT_USER)
      uni.removeStorageSync(STORAGE_KEYS.AUTH_TOKEN)
      
      console.log('用户已退出登录')
      
      return { success: true, message: '退出登录成功' }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, message: '退出登录失败' }
    }
  }

  // 保存当前用户到本地存储
  saveCurrentUser() {
    try {
      if (this.currentUser) {
        uni.setStorageSync(STORAGE_KEYS.CURRENT_USER, this.currentUser.toJSON())
      }
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  }

  // 保存认证token
  saveAuthToken() {
    try {
      if (this.authToken) {
        uni.setStorageSync(STORAGE_KEYS.AUTH_TOKEN, this.authToken)
      }
    } catch (error) {
      console.error('保存认证token失败:', error)
    }
  }

  // 加载当前用户
  loadCurrentUser() {
    try {
      const userData = uni.getStorageSync(STORAGE_KEYS.CURRENT_USER)
      const token = uni.getStorageSync(STORAGE_KEYS.AUTH_TOKEN)
      
      if (userData && token) {
        this.currentUser = User.fromJSON(userData)
        this.authToken = token
        console.log('加载用户信息成功:', this.currentUser.username)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      this.currentUser = null
      this.authToken = null
    }
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser
  }

  // 检查是否已登录
  isLoggedIn() {
    return this.currentUser !== null && this.authToken !== null
  }

  // 获取用户统计信息
  getUserStats() {
    if (!this.currentUser) return null
    
    try {
      const createdAt = new Date(this.currentUser.createdAt)
      const now = new Date()
      const registeredDays = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24))
      
      return {
        userId: this.currentUser.userId,
        username: this.currentUser.username,
        nickname: this.currentUser.nickname,
        createdAt: this.currentUser.createdAt,
        lastLoginAt: this.currentUser.lastLoginAt,
        registeredDays: Math.max(1, registeredDays)
      }
    } catch (error) {
      console.error('计算用户统计失败:', error)
      return {
        userId: this.currentUser.userId,
        username: this.currentUser.username,
        nickname: this.currentUser.nickname,
        createdAt: this.currentUser.createdAt,
        lastLoginAt: this.currentUser.lastLoginAt,
        registeredDays: 1
      }
    }
  }

  // 获取用户学习数据（从后端）
  async getUserData() {
    if (!this.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      const response = await ApiClient.get(`/user/${this.currentUser.userId}/data`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.message || '获取用户数据失败')
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
      throw error
    }
  }

  // 保存用户学习数据（到后端）
  async saveUserData(data) {
    if (!this.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      const response = await ApiClient.post(`/user/${this.currentUser.userId}/data`, data)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || '保存用户数据失败')
      }
      
      return result
    } catch (error) {
      console.error('保存用户数据失败:', error)
      throw error
    }
  }

  // 添加已学单词（到后端）
  async addLearnedWord(bookId, wordId) {
    if (!this.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      const response = await ApiClient.post(`/user/${this.currentUser.userId}/learned_words/${bookId}`, {
        word_id: wordId
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || '添加已学单词失败')
      }
      
      return result
    } catch (error) {
      console.error('添加已学单词失败:', error)
      throw error
    }
  }

  // 添加错误单词（到后端）
  async addWrongWord(bookId, wordId) {
    if (!this.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      const response = await ApiClient.post(`/user/${this.currentUser.userId}/wrong_words/${bookId}`, {
        word_id: wordId
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || '添加错误单词失败')
      }
      
      return result
    } catch (error) {
      console.error('添加错误单词失败:', error)
      throw error
    }
  }

  // 临时数据管理（未登录时使用）
  getTempData(key, defaultValue = null) {
    try {
      const tempKey = `${STORAGE_KEYS.TEMP_DATA_PREFIX}${key}`
      return uni.getStorageSync(tempKey) || defaultValue
    } catch (error) {
      console.error('获取临时数据失败:', error)
      return defaultValue
    }
  }

  setTempData(key, value) {
    try {
      const tempKey = `${STORAGE_KEYS.TEMP_DATA_PREFIX}${key}`
      uni.setStorageSync(tempKey, value)
      return true
    } catch (error) {
      console.error('保存临时数据失败:', error)
      return false
    }
  }

  clearTempData() {
    try {
      // 清除所有临时数据
      const storage = uni.getStorageInfoSync()
      storage.keys.forEach(key => {
        if (key.startsWith(STORAGE_KEYS.TEMP_DATA_PREFIX)) {
          uni.removeStorageSync(key)
        }
      })
      console.log('临时数据已清除')
    } catch (error) {
      console.error('清除临时数据失败:', error)
    }
  }

  // 数据迁移：将临时数据导入到登录账户
  async migrateTempDataToUser() {
    if (!this.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      // 获取所有临时数据
      const storage = uni.getStorageInfoSync()
      const tempData = {}
      
      storage.keys.forEach(key => {
        if (key.startsWith(STORAGE_KEYS.TEMP_DATA_PREFIX)) {
          const dataKey = key.replace(STORAGE_KEYS.TEMP_DATA_PREFIX, '')
          tempData[dataKey] = uni.getStorageSync(key)
        }
      })

      if (Object.keys(tempData).length > 0) {
        // 将临时数据保存到用户账户
        await this.saveUserData(tempData)
        
        // 清除临时数据
        this.clearTempData()
        
        console.log('临时数据迁移成功')
        return { success: true, message: '学习数据已导入到您的账户' }
      } else {
        return { success: true, message: '没有临时数据需要导入' }
      }
    } catch (error) {
      console.error('数据迁移失败:', error)
      return { success: false, message: '数据导入失败' }
    }
  }
}

// 创建全局用户管理器实例
const userManager = new UserManager()

// 导出用户管理器和相关函数
export default userManager

export {
  userManager,
  User,
  STORAGE_KEYS as USER_STORAGE_KEYS
}

// 便捷函数
export function getCurrentUser() {
  return userManager.getCurrentUser()
}

export function isLoggedIn() {
  return userManager.isLoggedIn()
}

export async function login(username, password) {
  return await userManager.login(username, password)
}

export async function register(username, password, nickname) {
  return await userManager.register(username, password, nickname)
}

export function logout() {
  return userManager.logout()
}

export function getUserStats() {
  return userManager.getUserStats()
}

// 新增：用户数据管理
export async function getUserData() {
  return await userManager.getUserData()
}

export async function saveUserData(data) {
  return await userManager.saveUserData(data)
}

export async function addLearnedWord(bookId, wordId) {
  return await userManager.addLearnedWord(bookId, wordId)
}

export async function addWrongWord(bookId, wordId) {
  return await userManager.addWrongWord(bookId, wordId)
}

export function getTempData(key, defaultValue) {
  return userManager.getTempData(key, defaultValue)
}

export function setTempData(key, value) {
  return userManager.setTempData(key, value)
}

export async function migrateTempDataToUser() {
  return await userManager.migrateTempDataToUser()
} 