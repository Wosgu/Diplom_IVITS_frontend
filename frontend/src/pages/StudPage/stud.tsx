import { useState, useEffect } from 'react';
import { FaLock, FaGraduationCap, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import './stud.css';

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

export const Stud = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAccessToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setError('Требуется авторизация');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const apiClient = axios.create({
          baseURL: 'http://26.112.181.193:8000',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const [userRes, groupsRes] = await Promise.all([
          apiClient.get('/api/users/me/'),
          apiClient.get('/api/groups/')
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
  }, []);

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) { 
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        setError('Сессия истекла. Войдите снова');
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.reload();
  };

  const getFullName = () => {
    if (!userData) return '';
    return `${userData.last_name} ${userData.first_name} ${userData.middle_name || ''}`.trim();
  };

  const getGroupNames = () => {
    if (!userData || groups.length === 0) return 'Загрузка...';
    return userData.groups
      .map(g => groups.find(gr => gr.id === g)?.name || '???')
      .join(', ');
  };

  const renderCourses = () => (
    <div className="courses-grid">
      {[1, 2, 3, 4].map(course => (
        <div key={course} className={`course-card ${course === 4 ? 'locked' : ''}`}>
          {course === 4 && (
            <div className="course-lock">
              <FaLock size={20} />
              <span>Доступ откроется позже</span>
            </div>
          )}
          <div className="course-header">
            <FaGraduationCap size={18} />
            <h3>Курс {course}</h3>
          </div>
          <ul className="course-content">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i}>Тема {i + 1}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

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
        {getAccessToken() ? (
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Выйти
          </button>
        ) : (
          <button onClick={handleLogin} className="login-btn">
            <FaSignInAlt /> Войти
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
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Выйти
        </button>
      </header>

      <main className="stud-content">
        <section className="profile-section">
          <h2>Личные данные</h2>
          <div className="profile-info">
            <div>
              <label>Email:</label>
              <p>{userData?.email}</p>
            </div>
            <div>
              <label>Группы:</label>
              <p>{getGroupNames()}</p>
            </div>
          </div>
        </section>

        <section className="courses-section">
          <h2>Прогресс обучения</h2>
          {renderCourses()}
        </section>
      </main>
    </div>
  );
};