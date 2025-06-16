import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { useEffect, useState } from 'react';

interface VKAuthButtonProps {
  isRegister: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL_ENDPOINTS;

export const VKAuthButton = ({ isRegister, isLoading, setIsLoading, setErrors }: VKAuthButtonProps) => {
  const location = useLocation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Основная функция обработки параметров авторизации
  const processAuthParams = (params: URLSearchParams) => {
    const access = params.get('access');
    const userId = params.get('user_id');
    const username = params.get('username');
    const code = params.get('code');

    console.log('Processing auth params:', { access, userId, code });

    if (access && userId) {
      console.log('Direct VK auth detected');
      handleDirectVKAuth(access, parseInt(userId, 10), username || '');
      return true;
    } else if (code) {
      console.log('VK callback code detected');
      handleVKCallback(code);
      return true;
    }
    return false;
  };

  // 1. Проверка при самом первом рендере (до загрузки React Router)
  useEffect(() => {
    // Используем setTimeout чтобы гарантировать выполнение после полной загрузки
    const timer = setTimeout(() => {
      const initialParams = new URLSearchParams(window.location.search);
      if (initialParams.toString() && !initialCheckDone) {
        console.log('Initial mount check - params found:', initialParams.toString());
        if (processAuthParams(initialParams)) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setInitialCheckDone(true);
      }
    }, 100); // Небольшая задержка для гарантии

    return () => clearTimeout(timer);
  }, []);

  // 2. Проверка при изменении URL через React Router
  useEffect(() => {
    if (location.search) {
      const routerParams = new URLSearchParams(location.search);
      console.log('Router location changed - checking params');
      if (processAuthParams(routerParams)) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location.search]);

  // 3. Дополнительная проверка через 1 секунду на случай пропуска
  useEffect(() => {
    const safetyCheck = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.toString()) {
        console.log('Safety check - params still present');
        if (processAuthParams(currentParams)) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }, 1000);

    return () => clearTimeout(safetyCheck);
  }, []);

  const handleDirectVKAuth = async (access_token: string, userId: number, username: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Сохраняем токен в cookie и sessionStorage для надежности
      const cookieOptions = `path=/; max-age=86400; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
      document.cookie = `access_token=${access_token}; ${cookieOptions}`;
      sessionStorage.setItem('vk_auth_processed', 'true');
      
      const userData = {
        id: userId,
        username: username || `vk_${userId}`,
        phone: null,
        first_name: '',
        last_name: '',
        middle_name: '',
        role: 'user',
        email: '',
        is_active: true,
        vk_avatar: ''
      };

      await login(access_token, userData);
      navigate('/');
    } catch (error) {
      console.error('VK auth error:', error);
      setErrors({ general: 'Ошибка авторизации через VK' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVKCallback = async (code: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/vk/callback/`, 
        { code }, 
        { withCredentials: true }
      );
      
      if (response.data.access) {
        const userData = {
          id: response.data.user_id,
          username: response.data.username,
          phone: response.data.phone || null,
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          middle_name: response.data.middle_name || '',
          role: 'user',
          email: response.data.email || '',
          is_active: true,
          vk_avatar: response.data.vk_avatar || ''
        };

        await login(response.data.access, userData);
        navigate('/');
      }
    } catch (error) {
      console.error('VK callback error:', error);
      setErrors({ general: 'Ошибка авторизации через VK' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVKLogin = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/vk/callback');
    window.location.href = `${API_BASE_URL}/auth/vk/init/?redirect_uri=${redirectUri}`;
  };

  return (
    <button
      type="button"
      className="vk-login-button"
      onClick={handleVKLogin}
      disabled={isLoading}
    >
      <svg className="vk-icon" width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12.65 18.24c-5.59 0-8.65-3.82-8.85-10.23h3.07c.15 4.88 2.44 6.97 4.46 7.37V8.01h2.91v4.23c2-.2 4.1-2.09 4.8-4.23h2.91c-.62 3.52-3.29 6.11-5.9 7.03 2.61.76 5.34 3.03 6.29 7.2h-3.36c-.72-2.62-2.86-4.38-5.33-4.6v4.6h-.4z" />
      </svg>
      {isRegister ? 'Зарегистрироваться через VK' : 'Войти с VK ID'}
    </button>
  );
};