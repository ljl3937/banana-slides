import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { OutlineEditor } from './pages/OutlineEditor';
import { DetailEditor } from './pages/DetailEditor';
import { SlidePreview } from './pages/SlidePreview';
import { SettingsPage } from './pages/Settings';
import { useProjectStore } from './store/useProjectStore';
import { useToast, GithubLink } from './components/shared';

function App() {
  const { currentProject, syncProject, error, setError } = useProjectStore();
  const { show, ToastContainer } = useToast();

  // 初始化认证Token（从URL或主系统同步）
  useEffect(() => {
    // 检查URL参数中是否有token
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      // 从URL中获取token并存储（使用统一键名）
      localStorage.setItem('unified_auth_token', urlToken);
      // 清除URL中的token参数
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // 如果没有token，检查是否已经有存储的token
      const existingToken = localStorage.getItem('unified_auth_token') || localStorage.getItem('token');
      if (!existingToken) {
        console.warn('[Banana Slides] No authentication token found. Please access via the main system or provide a token.');
      }
    }
  }, []);

  // 恢复项目状态
  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId && !currentProject) {
      syncProject();
    }
  }, [currentProject, syncProject]);

  // 显示全局错误
  useEffect(() => {
    if (error) {
      show({ message: error, type: 'error' });
      setError(null);
    }
  }, [error, setError, show]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/project/:projectId/outline" element={<OutlineEditor />} />
        <Route path="/project/:projectId/detail" element={<DetailEditor />} />
        <Route path="/project/:projectId/preview" element={<SlidePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
      <GithubLink />
    </BrowserRouter>
  );
}

export default App;

