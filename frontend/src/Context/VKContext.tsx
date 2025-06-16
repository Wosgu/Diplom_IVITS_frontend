import { useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';

interface VKAuthHandlerProps {
  children?: ReactNode;
}

export const VKAuthHandler = ({ children }: VKAuthHandlerProps) => {
  const location = useLocation();
  const { login } = useAuth();

  const processVKAuth = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = searchParams.get('access');
    const userId = searchParams.get('user_id');
    const username = searchParams.get('username');

    if (accessToken && userId) {
      // Сохраняем токен в куки
      Cookies.set('access_token', accessToken, {
        expires: 1, // 1 день
        secure: true,
        sameSite: 'strict'
      });

      // Создаем базовый объект пользователя
      const userData = {
        id: parseInt(userId, 10),
        username: username || `vk_${userId}`,
        first_name: '',
        last_name: '',
        middle_name: '',
        role: 'user',
        email: '',
        phone: null,
        is_active: true,
        vk_avatar: ''
      };

      // Выполняем вход
      login(accessToken, userData);

      // Очищаем URL от параметров
      window.history.replaceState({}, document.title, window.location.pathname);

      return true;
    }
    return false;
  };

  // Проверяем параметры при монтировании
  useEffect(() => {
    const timer = setTimeout(() => {
      if (processVKAuth()) {
        console.log('VK auth processed on mount');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Проверяем параметры при изменении location
  useEffect(() => {
    if (location.search) {
      if (processVKAuth()) {
        console.log('VK auth processed on location change');
      }
    }
  }, [location.search]);

  // Дополнительная проверка через секунду
  useEffect(() => {
    const safetyCheck = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.toString()) {
        if (processVKAuth()) {
          console.log('VK auth processed in safety check');
        }
      }
    }, 1000);

    return () => clearTimeout(safetyCheck);
  }, []);

  return <>{children}</>;
};