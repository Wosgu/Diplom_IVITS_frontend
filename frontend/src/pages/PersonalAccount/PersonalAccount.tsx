import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiEndpointHelper, useAuth } from '../../Context/AuthContext';
import './PersonalAccount.css';

interface UserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: string;
  groups: number[];
}

interface Group {
  id: number;
  name: string;
}

export const PersonalAccount = () => {
  const { userData: authUser, logout, checkAuth, getAuthHeader } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authUser) {
      setError('Требуется авторизация');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Проверяем актуальность токена
        await checkAuth();

        // Получаем заголовки авторизации с await
        const authHeader = await getAuthHeader();

        // Используем ApiEndpointHelper для получения URL
        const [userRes, groupsRes] = await Promise.all([
          axios.get<UserData>(ApiEndpointHelper.userMe(), authHeader),
          axios.get<Group[]>(ApiEndpointHelper.groups(), authHeader).catch(() => ({ data: [] }))
        ]);

        setUserData(userRes.data);
        setGroups(groupsRes.data);

      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser, checkAuth, getAuthHeader]);

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) { 
      if (error.response?.status === 401) {
        setError('Сессия истекла. Войдите снова');
        logout();
      } else {
        setError(`Ошибка ${error.response?.status || 'соединения'}`);
      }
    } else {
      setError('Неизвестная ошибка');
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const getFullName = () => {
    if (!userData) return '';
    return `${userData.last_name} ${userData.first_name} ${userData.middle_name || ''}`.trim();
  };

  const getGroupNames = () => {
    if (!userData?.groups || !groups.length) return 'Нет групп';
    
    const groupNames = userData.groups
      .map(groupId => {
        const group = groups.find(g => g.id === groupId);
        return group ? group.name : null;
      })
      .filter(Boolean);
    
    return groupNames.length > 0 ? groupNames.join(', ') : 'Нет групп';
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ошибка</h2>
        <p>{error}</p>
        {authUser ? (
          <button onClick={logout} className="logout-btn">
            Выйти
          </button>
        ) : (
          <button onClick={handleLogin} className="login-btn">
            Войти
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="stud-container">
      <header className="stud-header">
        <div className="profile-header">
          <img
            src="/default_avatar.jpg"
            alt="Аватар"
            className="profile-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/fallback_avatar.jpg';
            }}
          />
          <div>
            <h1>{getFullName()}</h1>
            <div className="stud-meta">
              <span>@{userData?.username}</span>
              <span>{userData?.role}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="stud-content">
        <section className="profile-section">
          <h2>Личные данные</h2>
          <div className="profile-info">
            <div>
              <label>Email:</label>
              <p>{userData?.email || 'Не указан'}</p>
            </div>
            <div>
              <label>Группы:</label>
              <p>{getGroupNames()}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};