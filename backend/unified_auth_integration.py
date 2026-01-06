"""
Banana Slides 统一认证集成
将主系统的JWT Token验证添加到Banana Slides后端
"""
import sys
import os

# 添加主系统路径到Python path
MAIN_SYSTEM_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
if MAIN_SYSTEM_PATH not in sys.path:
    sys.path.insert(0, MAIN_SYSTEM_PATH)

# 确保 SECRET_KEY 环境变量已加载（从 banana-slides/.env）
from pathlib import Path
from dotenv import load_dotenv
_banana_env = Path(__file__).parent.parent / '.env'
if _banana_env.exists():
    load_dotenv(_banana_env, override=True)

# 直接导入 unified_auth 模块，避免触发 integration.__init__.py 的其他导入
import importlib.util
spec = importlib.util.spec_from_file_location(
    "unified_auth",
    os.path.join(MAIN_SYSTEM_PATH, "src/backend/integration/unified_auth.py")
)
unified_auth_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(unified_auth_module)

# 获取需要的函数
create_flask_auth_middleware = unified_auth_module.create_flask_auth_middleware
get_unified_auth_verifier = unified_auth_module.get_unified_auth_verifier
from flask import request, g
import logging

logger = logging.getLogger(__name__)

# 创建认证装饰器
require_auth = create_flask_auth_middleware()


def init_unified_auth(app):
    """
    初始化统一认证
    在Flask app中添加认证支持
    """
    
    @app.before_request
    def check_auth_token():
        """检查所有API请求的认证Token"""
        # 跳过健康检查和静态文件
        if request.path in ['/health', '/', '/favicon.ico'] or request.path.startswith('/files/'):
            return
        
        # 跳过 OPTIONS 预检请求（CORS）
        if request.method == 'OPTIONS':
            return
        
        # 只检查API路由
        if request.path.startswith('/api/'):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return {
                    'success': False,
                    'error': 'Missing authorization header'
                }, 401
            
            # 验证Token
            verifier = get_unified_auth_verifier()
            user = verifier.get_user_from_token(auth_header)
            
            if not user:
                return {
                    'success': False,
                    'error': 'Invalid or expired token'
                }, 401
            
            # 将用户信息存储到全局上下文
            g.current_user = user
    
    logger.info("Unified auth initialized for Banana Slides")
