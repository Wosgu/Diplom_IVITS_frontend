import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ApiEndpointHelper } from '../../Context/AuthContext';
import './Adminpanel.css';

interface User {
  uuid: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  role_display: string;
  is_active: boolean;
  is_blocked: boolean;
  date_joined: string;
  last_login: string;
  status: string;
}

interface UserDetails extends User {
  first_name: string;
  last_name: string;
  middle_name: string;
  blocked_at: string | null;
  blocked_reason: string | null;
  blocked_by: string | null;
  phone_verified: boolean;
  is_verified: boolean;
  activity_logs: ActivityLog[];
}

interface ActivityLog {
  action: string;
  action_display: string;
  ip_address: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface Stats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  users_by_role: { role: string; count: number }[];
  registrations_last_30_days: { date: string; count: number }[];
}

interface Pagination {
  count: number;
  next: string | null;
  previous: string | null;
}

export const Adminpanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    count: 0,
    next: null,
    previous: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    is_active: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    middle_name: '',
    email: ''
  });

  const getAuthConfig = () => {
    return {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getCookie('access_token')}`
      }
    };
  };

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const validateMiddleName = (name: string): boolean => {
    // Проверка на русские буквы и первую заглавную
    const russianRegex = /^[А-ЯЁ][а-яё]*$/;
    return russianRegex.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || validateMiddleName(value)) {
      setSelectedUser(prev => prev ? { ...prev, middle_name: value } : null);
      setValidationErrors(prev => ({ ...prev, middle_name: '' }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        middle_name: 'Отчество должно содержать только русские буквы и начинаться с заглавной'
      }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedUser(prev => prev ? { ...prev, email: value } : null);
    if (value === '' || validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        email: 'Введите корректный email адрес'
      }));
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.is_active) params.append('is_active', filters.is_active);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('page', page.toString());

      const response = await axios.get(
        ApiEndpointHelper.getUrl(`/api/admin/users/?${params.toString()}`),
        getAuthConfig()
      );
      setUsers(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      });
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (uuid: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        ApiEndpointHelper.getUrl(`/api/admin/users/${uuid}/`),
        getAuthConfig()
      );
      setSelectedUser(response.data);
      setOpenDialog(true);
      setValidationErrors({
        middle_name: '',
        email: ''
      });
    } catch (err) {
      setError('Ошибка при загрузке данных пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        ApiEndpointHelper.getUrl('/api/admin/stats/'),
        getAuthConfig()
      );
      setStats(response.data);
    } catch (err) {
      setError('Ошибка при загрузке статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (uuid: string, data: Partial<UserDetails>) => {
    // Проверка валидации перед отправкой
    if (data.middle_name && !validateMiddleName(data.middle_name)) {
      setValidationErrors(prev => ({
        ...prev,
        middle_name: 'Отчество должно содержать только русские буквы и начинаться с заглавной'
      }));
      return;
    }

    if (data.email && !validateEmail(data.email)) {
      setValidationErrors(prev => ({
        ...prev,
        email: 'Введите корректный email адрес'
      }));
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        ApiEndpointHelper.getUrl(`/api/admin/users/${uuid}/`),
        data,
        getAuthConfig()
      );
      setSuccess('Данные пользователя успешно обновлены');
      fetchUsers();
      if (selectedUser?.uuid === uuid) {
        fetchUserDetails(uuid);
      }
    } catch (err) {
      setError('Ошибка при обновлении данных пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (uuid: string, reason: string) => {
    setLoading(true);
    try {
      await axios.patch(
        ApiEndpointHelper.getUrl(`/api/admin/users/${uuid}/block/`),
        { reason },
        getAuthConfig()
      );
      setSuccess('Пользователь успешно заблокирован');
      setOpenBlockDialog(false);
      setBlockReason('');
      fetchUsers();
      if (selectedUser?.uuid === uuid) {
        fetchUserDetails(uuid);
      }
    } catch (err) {
      setError('Ошибка при блокировке пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (uuid: string) => {
    setLoading(true);
    try {
      await axios.patch(
        ApiEndpointHelper.getUrl(`/api/admin/users/${uuid}/unblock/`),
        {},
        getAuthConfig()
      );
      setSuccess('Пользователь успешно разблокирован');
      fetchUsers();
      if (selectedUser?.uuid === uuid) {
        fetchUserDetails(uuid);
      }
    } catch (err) {
      setError('Ошибка при разблокировке пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchUsers();
    } else {
      fetchStats();
    }
  }, [page, filters, tabValue]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const getInitials = (name?: string, username?: string) => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    if (username && username.trim().length > 0) {
      return username.trim().charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="admin-container">
      <h1 className="admin-header">Административная панель</h1>

      <div className="admin-tabs">
        <button
          className={`tab-button ${tabValue === 0 ? 'active' : ''}`}
          onClick={() => handleTabChange(0)}
        >
          Управление пользователями
        </button>
        <button
          className={`tab-button ${tabValue === 1 ? 'active' : ''}`}
          onClick={() => handleTabChange(1)}
        >
          Статистика
        </button>
      </div>

      {tabValue === 0 ? (
        <>
          <div className="filter-container">
            <input
              type="text"
              placeholder="Поиск"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="search-field"
            />
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="role-select"
            >
              <option value="">Все роли</option>
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
              <option value="admin">Администратор</option>
            </select>
            <select
              name="is_active"
              value={filters.is_active}
              onChange={handleFilterChange}
              className="status-select"
            >
              <option value="">Все статусы</option>
              <option value="true">Активные</option>
              <option value="false">Неактивные</option>
            </select>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleDateChange}
              className="date-picker"
            />
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleDateChange}
              className="date-picker"
            />
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              {/* Мобильные карточки */}
              <div className="mobile-user-cards">
                {users.map(user => (
                  <div key={user.uuid} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar">{getInitials(user.full_name, user.username)}</div>
                      <div className="user-info">
                        <div className="user-name">{user.full_name || user.username}</div>
                        <div className="user-username">@{user.username}</div>
                      </div>
                    </div>
                    <div className="user-card-field"><strong>Email:</strong> {user.email}</div>
                    <div className="user-card-field"><strong>Роль:</strong> {user.role_display}</div>
                    <div className="user-card-field">
                      <strong>Статус:</strong>
                      <span className={`status-chip ${user.is_blocked ? 'blocked' : user.is_active ? 'active' : 'inactive'}`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="user-card-field">
                      <strong>Дата регистрации:</strong> {format(new Date(user.date_joined), 'dd.MM.yyyy')}
                    </div>
                    <div className="user-card-actions">
                      <button className="action-button" onClick={() => fetchUserDetails(user.uuid)}>
                        Подробнее
                      </button>
                      {user.is_blocked ? (
                        <button className="action-button unblock-button" onClick={() => unblockUser(user.uuid)}>
                          Разблокировать
                        </button>
                      ) : (
                        <button
                          className="action-button block-button"
                          onClick={() => {
                            setSelectedUser(user as UserDetails);
                            setOpenBlockDialog(true);
                          }}
                        >
                          Блокировать
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Десктопная таблица */}
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Пользователь</th>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Статус</th>
                      <th>Дата регистрации</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.uuid} className="table-row">
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{getInitials(user.full_name, user.username)}</div>
                            <div>
                              <div className="user-name">{user.full_name || user.username}</div>
                              <div className="user-username">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.role_display}</td>
                        <td>
                          <span className={`status-chip ${user.is_blocked ? 'blocked' : user.is_active ? 'active' : 'inactive'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{format(new Date(user.date_joined), 'dd.MM.yyyy')}</td>
                        <td>
                          <button className="action-button" onClick={() => fetchUserDetails(user.uuid)}>
                            Подробнее
                          </button>
                          {user.is_blocked ? (
                            <button className="action-button unblock-button" onClick={() => unblockUser(user.uuid)}>
                              Разблокировать
                            </button>
                          ) : (
                            <button
                              className="action-button block-button"
                              onClick={() => {
                                setSelectedUser(user as UserDetails);
                                setOpenBlockDialog(true);
                              }}
                            >
                              Блокировать
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="pagination-container">
            <button
              disabled={!pagination.previous || loading}
              onClick={() => setPage(p => p - 1)}
              className="pagination-button"
            >
              Назад
            </button>
            <span className="page-info">
              Страница {page} из {Math.ceil(pagination.count / 10)}
            </span>
            <button
              disabled={!pagination.next || loading}
              onClick={() => setPage(p => p + 1)}
              className="pagination-button"
            >
              Вперед
            </button>
          </div>
        </>
      ) : (
        <>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : stats ? (
            <div className="stats-container">
              <h2 className="stats-title">Общая статистика</h2>
              <div className="stats-cards">
                <div className="stats-card">
                  <div className="stats-card-title">Всего пользователей</div>
                  <div className="stats-card-value">{stats.total_users}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-card-title">Активных</div>
                  <div className="stats-card-value">{stats.active_users}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-card-title">Заблокированных</div>
                  <div className="stats-card-value">{stats.blocked_users}</div>
                </div>
              </div>

              <h2 className="stats-title">Распределение по ролям</h2>
              <div className="stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>Роль</th>
                      <th>Количество</th>
                      <th>Процент</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users_by_role.map(item => (
                      <tr key={item.role}>
                        <td>
                          {item.role === 'student'
                            ? 'Студент'
                            : item.role === 'teacher'
                              ? 'Преподаватель'
                              : item.role === 'admin'
                                ? 'Администратор'
                                : 'Гость'}
                        </td>
                        <td>{item.count}</td>
                        <td>
                          {Math.round((item.count / stats.total_users) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Мобильные карточки для ролей */}
              <div className="stats-table-mobile">
                {stats.users_by_role.map(item => (
                  <div className="stats-row" key={item.role}>
                    <div className="stats-row-label">Роль</div>
                    <div className="stats-row-value">
                      {item.role === 'student'
                        ? 'Студент'
                        : item.role === 'teacher'
                          ? 'Преподаватель'
                          : item.role === 'admin'
                            ? 'Администратор'
                            : 'Гость'}
                    </div>
                    <div className="stats-row-label">Количество</div>
                    <div className="stats-row-value">{item.count}</div>
                    <div className="stats-row-label">Процент</div>
                    <div className="stats-row-value">
                      {Math.round((item.count / stats.total_users) * 100)}%
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="stats-title">Регистрации за последние 30 дней</h2>
              <div className="stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Количество регистраций</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.registrations_last_30_days.map(item => (
                      <tr key={item.date}>
                        <td>{item.date}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Мобильные карточки для регистраций */}
              <div className="stats-table-mobile">
                {stats.registrations_last_30_days.map(item => (
                  <div className="stats-row" key={item.date}>
                    <div className="stats-row-label">Дата</div>
                    <div className="stats-row-value">{item.date}</div>
                    <div className="stats-row-label">Количество регистраций</div>
                    <div className="stats-row-value">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>Нет данных для отображения</div>
          )}

        </>
      )}

      {/* Диалог с подробной информацией о пользователе */}
      {openDialog && selectedUser && (
        <div className="modal-overlay">
          <div className="user-dialog">
            <div className="dialog-header">
              <div className="dialog-user-header">
                <div className="dialog-avatar">
                  {getInitials(selectedUser.full_name, selectedUser.username)}
                </div>
                <div>
                  <h3>{selectedUser.full_name || selectedUser.username || 'Неизвестный пользователь'}</h3>
                  <div className="dialog-username">@{selectedUser.username}</div>
                </div>
              </div>
              <button className="close-button" onClick={handleCloseDialog}>
                &times;
              </button>
            </div>
            <div className="dialog-content">
              <div className="user-section">
                <h4 className="section-title">Основная информация</h4>
                <div className="user-fields">
                  <div className="form-group">
                    <label>Имя</label>
                    <input
                      type="text"
                      value={selectedUser.first_name || ''}
                      onChange={e =>
                        setSelectedUser({
                          ...selectedUser,
                          first_name: e.target.value
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Фамилия</label>
                    <input
                      type="text"
                      value={selectedUser.last_name || ''}
                      onChange={e =>
                        setSelectedUser({
                          ...selectedUser,
                          last_name: e.target.value
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Отчество</label>
                    <input
                      type="text"
                      value={selectedUser.middle_name || ''}
                      onChange={handleMiddleNameChange}
                      className={`form-input ${validationErrors.middle_name ? 'error' : ''}`}
                    />
                    {validationErrors.middle_name && (
                      <div className="validation-error">{validationErrors.middle_name}</div>
                    )}
                  </div>
                </div>
                <div className="user-fields">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={selectedUser.email || ''}
                      onChange={handleEmailChange}
                      className={`form-input ${validationErrors.email ? 'error' : ''}`}
                    />
                    {validationErrors.email && (
                      <div className="validation-error">{validationErrors.email}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Роль</label>
                    <select
                      value={selectedUser.role || 'student'}
                      onChange={e =>
                        setSelectedUser({
                          ...selectedUser,
                          role: e.target.value
                        })
                      }
                      className="form-input"
                    >
                      <option value="student">Студент</option>
                      <option value="teacher">Преподаватель</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="user-section">
                <h4 className="section-title">Статус</h4>
                <div className="status-chips">
                  <span className={`status-chip ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                    {selectedUser.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                  <span className={`status-chip ${selectedUser.is_blocked ? 'blocked' : 'unblocked'}`}>
                    {selectedUser.is_blocked ? 'Заблокирован' : 'Не заблокирован'}
                  </span>
                </div>
                {selectedUser.is_blocked && (
                  <div className="block-info">
                    <p>
                      <strong>Причина блокировки:</strong> {selectedUser.blocked_reason || 'не указана'}
                    </p>
                    <p>
                      <strong>Дата блокировки:</strong> {selectedUser.blocked_at
                        ? format(new Date(selectedUser.blocked_at), 'dd.MM.yyyy HH:mm')
                        : 'не указана'}
                    </p>
                  </div>
                )}
              </div>

              <div className="user-section">
                <h4 className="section-title">Журнал активности</h4>
                <div className="activity-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Действие</th>
                        <th></th>
                        <th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.activity_logs?.map((log, index) => (
                        <tr key={index}>
                          <td>{log.action_display}</td>
                          <td>{log.ip_address}</td>
                          <td>
                            {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button
                onClick={handleCloseDialog}
                className="dialog-button"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  const { activity_logs, ...userData } = selectedUser;
                  updateUser(selectedUser.uuid, userData);
                }}
                className="dialog-button primary"
                disabled={loading || !!validationErrors.middle_name || !!validationErrors.email}
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог блокировки пользователя */}
      {openBlockDialog && selectedUser && (
        <div className="modal-overlay">
          <div className="block-dialog">
            <div className="dialog-header">
              <h3>Блокировка пользователя</h3>
              <button
                className="close-button"
                onClick={() => setOpenBlockDialog(false)}
              >
                &times;
              </button>
            </div>
            <div className="dialog-content">
              <p>
                Вы собираетесь заблокировать пользователя <strong>{selectedUser.username}</strong> ({selectedUser.full_name || 'Без имени'})
              </p>
              <div className="form-group">
                <label>Причина блокировки</label>
                <textarea
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="block-reason-field"
                  required
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button
                onClick={() => setOpenBlockDialog(false)}
                className="dialog-button"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  if (selectedUser) {
                    blockUser(selectedUser.uuid, blockReason);
                  }
                }}
                className="dialog-button danger"
                disabled={!blockReason || loading}
              >
                Заблокировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Уведомления */}
      {error && (
        <div className="snackbar error">
          <div className="alert">
            <span>{error}</span>
            <button className="close-button" onClick={handleCloseSnackbar}>
              &times;
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="snackbar success">
          <div className="alert">
            <span>{success}</span>
            <button className="close-button" onClick={handleCloseSnackbar}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};