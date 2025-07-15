#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
记意 Parli 后端API
提供用户注册、登录、学习数据存储服务
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import hashlib
import os
import time
import uuid
from datetime import datetime
import threading

app = Flask(__name__)
# 配置CORS允许来自前端开发服务器的请求
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173', '*'], 
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# 数据存储路径
DATA_DIR = './data'
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
USER_DATA_DIR = os.path.join(DATA_DIR, 'user_data')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(USER_DATA_DIR, exist_ok=True)

# 文件锁，防止并发写入冲突
file_lock = threading.Lock()

def safe_read_json(file_path, default_value=None):
    """安全读取JSON文件"""
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return default_value if default_value is not None else []
    except Exception as e:
        print(f"读取文件失败 {file_path}: {e}")
        return default_value if default_value is not None else []

def safe_write_json(file_path, data):
    """安全写入JSON文件"""
    try:
        with file_lock:
            # 先写入临时文件，然后重命名，保证原子性
            temp_file = file_path + '.tmp'
            with open(temp_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            os.replace(temp_file, file_path)
            return True
    except Exception as e:
        print(f"写入文件失败 {file_path}: {e}")
        return False

def hash_password(password):
    """密码加密"""
    salt = "parli_italiano_2024_backend"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def generate_token():
    """生成会话令牌"""
    return str(uuid.uuid4()) + str(int(time.time()))

def get_user_data_file(user_id):
    """获取用户数据文件路径"""
    return os.path.join(USER_DATA_DIR, f'{user_id}.json')

@app.route('/api/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        nickname = data.get('nickname', '').strip()
        
        # 验证输入
        if not username or not password or not nickname:
            return jsonify({
                'success': False,
                'message': '用户名、密码和昵称不能为空'
            })
        
        if len(username) < 3:
            return jsonify({
                'success': False,
                'message': '用户名至少3个字符'
            })
        
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': '密码至少6个字符'
            })
        
        if len(nickname) < 2:
            return jsonify({
                'success': False,
                'message': '昵称至少2个字符'
            })
        
        # 读取现有用户
        users = safe_read_json(USERS_FILE, [])
        
        # 检查用户名是否已存在
        for user in users:
            if user['username'] == username:
                return jsonify({
                    'success': False,
                    'message': '用户名已存在'
                })
        
        # 创建新用户
        user_id = f"user_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()
        
        new_user = {
            'user_id': user_id,
            'username': username,
            'nickname': nickname,
            'password_hash': hash_password(password),
            'created_at': now,
            'last_login_at': now
        }
        
        users.append(new_user)
        
        # 保存用户列表
        if safe_write_json(USERS_FILE, users):
            # 创建用户数据文件
            user_data = {
                'learned_words': {},  # 按书籍ID分组: {book_id: [word_ids]}
                'wrong_words': {},    # 按书籍ID分组: {book_id: [word_ids]}
                'progress': {},       # 按书籍ID分组: {book_id: progress_info}
                'current_book_id': 1,
                'created_at': now,
                'updated_at': now
            }
            safe_write_json(get_user_data_file(user_id), user_data)
            
            return jsonify({
                'success': True,
                'message': '注册成功',
                'user': {
                    'user_id': user_id,
                    'username': username,
                    'nickname': nickname
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '注册失败，请重试'
            })
    
    except Exception as e:
        print(f"注册失败: {e}")
        return jsonify({
            'success': False,
            'message': '注册失败，请重试'
        })

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': '用户名和密码不能为空'
            })
        
        # 读取用户列表
        users = safe_read_json(USERS_FILE, [])
        password_hash = hash_password(password)
        
        # 查找用户
        user = None
        for u in users:
            if u['username'] == username and u['password_hash'] == password_hash:
                user = u
                break
        
        if user:
            # 更新最后登录时间
            user['last_login_at'] = datetime.now().isoformat()
            safe_write_json(USERS_FILE, users)
            
            # 生成登录令牌
            token = generate_token()
            
            return jsonify({
                'success': True,
                'message': '登录成功',
                'token': token,
                'user': {
                    'user_id': user['user_id'],
                    'username': user['username'],
                    'nickname': user['nickname'],
                    'created_at': user['created_at'],
                    'last_login_at': user['last_login_at']
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '用户名或密码错误'
            })
    
    except Exception as e:
        print(f"登录失败: {e}")
        return jsonify({
            'success': False,
            'message': '登录失败，请重试'
        })

@app.route('/api/user/<user_id>/data', methods=['GET'])
def get_user_data(user_id):
    """获取用户学习数据"""
    try:
        user_data = safe_read_json(get_user_data_file(user_id), {
            'learned_words': {},
            'wrong_words': {},
            'progress': {},
            'current_book_id': 1
        })
        
        return jsonify({
            'success': True,
            'data': user_data
        })
    
    except Exception as e:
        print(f"获取用户数据失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取数据失败'
        })

@app.route('/api/user/<user_id>/data', methods=['POST'])
def save_user_data(user_id):
    """保存用户学习数据"""
    try:
        data = request.get_json()
        
        # 读取现有数据
        user_data = safe_read_json(get_user_data_file(user_id), {
            'learned_words': {},
            'wrong_words': {},
            'progress': {},
            'current_book_id': 1,
            'created_at': datetime.now().isoformat()
        })
        
        # 更新数据
        if 'learned_words' in data:
            user_data['learned_words'] = data['learned_words']
        if 'wrong_words' in data:
            user_data['wrong_words'] = data['wrong_words']
        if 'progress' in data:
            user_data['progress'] = data['progress']
        if 'current_book_id' in data:
            user_data['current_book_id'] = data['current_book_id']
        
        user_data['updated_at'] = datetime.now().isoformat()
        
        # 保存数据
        if safe_write_json(get_user_data_file(user_id), user_data):
            return jsonify({
                'success': True,
                'message': '数据保存成功'
            })
        else:
            return jsonify({
                'success': False,
                'message': '数据保存失败'
            })
    
    except Exception as e:
        print(f"保存用户数据失败: {e}")
        return jsonify({
            'success': False,
            'message': '保存数据失败'
        })

@app.route('/api/user/<user_id>/learned_words/<book_id>', methods=['POST'])
def add_learned_word(user_id, book_id):
    """添加已学单词"""
    try:
        data = request.get_json()
        word_id = data.get('word_id')
        
        if not word_id:
            return jsonify({
                'success': False,
                'message': '单词ID不能为空'
            })
        
        # 读取用户数据
        user_data = safe_read_json(get_user_data_file(user_id), {
            'learned_words': {},
            'wrong_words': {},
            'progress': {},
            'current_book_id': 1
        })
        
        # 初始化书籍数据
        if book_id not in user_data['learned_words']:
            user_data['learned_words'][book_id] = []
        
        # 添加单词（避免重复）
        if word_id not in user_data['learned_words'][book_id]:
            user_data['learned_words'][book_id].append(word_id)
        
        user_data['updated_at'] = datetime.now().isoformat()
        
        # 保存数据
        if safe_write_json(get_user_data_file(user_id), user_data):
            return jsonify({
                'success': True,
                'message': '单词添加成功'
            })
        else:
            return jsonify({
                'success': False,
                'message': '添加失败'
            })
    
    except Exception as e:
        print(f"添加已学单词失败: {e}")
        return jsonify({
            'success': False,
            'message': '添加失败'
        })

@app.route('/api/user/<user_id>/wrong_words/<book_id>', methods=['POST'])
def add_wrong_word(user_id, book_id):
    """添加错误单词"""
    try:
        data = request.get_json()
        word_id = data.get('word_id')
        
        if not word_id:
            return jsonify({
                'success': False,
                'message': '单词ID不能为空'
            })
        
        # 读取用户数据
        user_data = safe_read_json(get_user_data_file(user_id), {
            'learned_words': {},
            'wrong_words': {},
            'progress': {},
            'current_book_id': 1
        })
        
        # 初始化书籍数据
        if book_id not in user_data['wrong_words']:
            user_data['wrong_words'][book_id] = []
        
        # 添加单词（避免重复）
        if word_id not in user_data['wrong_words'][book_id]:
            user_data['wrong_words'][book_id].append(word_id)
        
        user_data['updated_at'] = datetime.now().isoformat()
        
        # 保存数据
        if safe_write_json(get_user_data_file(user_id), user_data):
            return jsonify({
                'success': True,
                'message': '错题添加成功'
            })
        else:
            return jsonify({
                'success': False,
                'message': '添加失败'
            })
    
    except Exception as e:
        print(f"添加错误单词失败: {e}")
        return jsonify({
            'success': False,
            'message': '添加失败'
        })

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'message': '记意 Parli 后端服务运行正常',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 记意 Parli 后端服务启动中...")
    print("📊 数据存储目录:", DATA_DIR)
    print("🌐 服务地址: http://localhost:8080")
    print("📋 API文档:")
    print("  POST /api/register - 用户注册")
    print("  POST /api/login - 用户登录")
    print("  GET  /api/user/<user_id>/data - 获取用户数据")
    print("  POST /api/user/<user_id>/data - 保存用户数据")
    print("  GET  /api/health - 健康检查")
    app.run(debug=True, host='0.0.0.0', port=8080) 