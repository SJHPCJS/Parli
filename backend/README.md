# 记意 Parli 后端服务

## 🚀 快速开始

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 启动服务
```bash
python app.py
```

服务启动后，你会看到：
```
🚀 记意 Parli 后端服务启动中...
📊 数据存储目录: ./data
🌐 服务地址: http://localhost:8080
📋 API文档:
  POST /api/register - 用户注册
  POST /api/login - 用户登录
  GET  /api/user/<user_id>/data - 获取用户数据
  POST /api/user/<user_id>/data - 保存用户数据
  GET  /api/health - 健康检查
```

## 📂 数据存储

用户数据存储在 `./data/` 目录下：
- `users.json` - 用户基本信息（用户名、密码hash、注册时间等）
- `user_data/` - 用户学习数据文件夹
  - `user_xxx.json` - 每个用户的学习数据（已学单词、错题、进度等）

## 🔐 安全性

- ✅ 密码使用 SHA256 + 盐值加密存储
- ✅ 文件读写使用线程锁，防止并发冲突
- ✅ 原子性写入，先写临时文件再重命名
- ✅ CORS 支持，允许前端跨域访问

## 🌐 API 接口

### 注册用户
```http
POST /api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "nickname": "测试用户"
}
```

### 用户登录
```http
POST /api/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

### 获取用户数据
```http
GET /api/user/{user_id}/data
```

### 保存用户数据
```http
POST /api/user/{user_id}/data
Content-Type: application/json

{
  "learned_words": {
    "1": [123, 456, 789]
  },
  "wrong_words": {
    "1": [111, 222]
  },
  "current_book_id": 1
}
```

## 🚨 注意事项

1. **首次使用前，请确保已安装Python和pip**
2. **请保持后端服务运行状态，前端需要连接到后端API**
3. **数据文件会自动创建，无需手动创建**
4. **如需在其他设备访问，请修改app.py中的host设置**

## 🔧 配置修改

如需修改端口或其他配置，请编辑 `app.py` 文件底部：

```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

- `port=5000` - 修改端口号
- `host='0.0.0.0'` - 允许外网访问（默认只允许本地访问）
- `debug=True` - 开发模式（生产环境建议改为False） 