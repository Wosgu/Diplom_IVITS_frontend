import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
// Импортируем типы

const API_BASE_URL = import.meta.env.VITE_BASE_URL_ENDPOINTS;
export interface UserData {
  id: number;
  username: string;
  phone: string | null;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: string;
  is_active: boolean;
  vk_avatar?: string;
}
export const VKCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      const accessToken = searchParams.get('access');
      const userId = searchParams.get('user_id');
      const username = searchParams.get('username');
      const code = searchParams.get('code');

      try {
        if (accessToken && userId) {
          // Преобразуем userId в number
          const userIdNumber = parseInt(userId, 10);
          if (isNaN(userIdNumber)) {
            throw new Error('Invalid user ID');
          }

          // Создаем объект с правильными типами
          const userData: Partial<UserData> = {
            id: userIdNumber,
            username: username || `vk_${userId}`,
            phone: searchParams.get('phone') || null,
            email: searchParams.get('email') || '',
            first_name: '',
            last_name: '',
            role: 'user',
            is_active: true
          };

          // Сохраняем токен в cookies
          document.cookie = `access_token=${accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
          
          await login(accessToken, userData);
          navigate('/');
        } else if (code) {
          const response = await axios.get(`${API_BASE_URL}/auth/vk/callback?code=${code}`);
          const { access_token, user } = response.data;
          
          document.cookie = `access_token=${access_token}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
          await login(access_token, user);
          navigate('/');
        } else {
          throw new Error('Missing auth parameters');
        }
      } catch (error) {
        console.error('VK auth failed:', error);
        navigate('/login', { state: { error: 'VK authentication failed' } });
      }
    };

    processAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Processing VK authentication...</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default VKCallbackPage;