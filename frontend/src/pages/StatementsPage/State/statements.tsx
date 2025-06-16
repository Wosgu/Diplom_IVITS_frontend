import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './statements.css';
import { FaChevronDown, FaChevronRight, FaTrash, FaPaperclip } from 'react-icons/fa';
import { Adminstatements } from '../AdminState/adminstatements';
import { useAuth } from '../../../Context/AuthContext';
import Cookies from 'js-cookie';

// Типы данных
type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  role: string;
};

type Attachment = {
  id: number;
  file: string;
  file_url: string;
  uploaded_at: string;
};

type Application = {
  id: number;
  user: User;
  type: string;
  type_display: string;
  description: string;
  status: string;
  status_display: string;
  created_at: string;
  updated_at: string;
  admin_comment: string | null;
  attachments: Attachment[];
};

type ApplicationsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
};

type ApplicationType = {
  id: number;
  name: string;
  code: string;
};

type ApplicationTypesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApplicationType[];
};

type NewApplication = {
  type: string;
  description: string;
  attachments: File[];
};

// Константы для валидации файлов
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_COUNT = 5;
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 
  'image/png', 
  'application/pdf', 
  'application/zip', 
  'application/x-rar-compressed'
];

export const Statements = () => {
  const { userData, checkAuth, logout } = useAuth();
  const [applicationsData, setApplicationsData] = useState<ApplicationsResponse>({
    count: 0,
    next: null,
    previous: null,
    results: []
  });
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [newApplication, setNewApplication] = useState<NewApplication>({
    type: '',
    description: '',
    attachments: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Настройка axios
  const api = axios.create({
    baseURL: 'https://vits44.ru/api/',
    timeout: 10000,
    withCredentials: true
  });

  // Интерцептор для добавления токена
  api.interceptors.request.use(async (config) => {
    try {
      await checkAuth();
      const token = Cookies.get('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (err) {
      console.error('Ошибка в интерцепторе запроса:', err);
      throw err;
    }
  });

  // Интерцептор для обработки ошибок
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await checkAuth();
          const newToken = Cookies.get('access_token');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Не удалось обновить токен:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  // Загрузка данных
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [typesResponse, appsResponse] = await Promise.all([
        api.get<ApplicationTypesResponse>('application-types/'),
        api.get<ApplicationsResponse>('applications/', {
          params: {
            search: searchQuery,
            type: typeFilter,
            status: statusFilter
          }
        })
      ]);

      setApplicationTypes(typesResponse.data.results);
      setApplicationsData(appsResponse.data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ошибок
  const handleError = (err: unknown) => {
    let errorMessage = 'Произошла ошибка при загрузке данных';
    
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        errorMessage = 'Сессия истекла. Пожалуйста, войдите снова.';
        logout();
      } else if (err.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
      } else {
        errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message;
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    setError(errorMessage);
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, typeFilter, statusFilter]);

  // Раскрытие/скрытие строки
  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Обработка выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Проверка количества файлов
      if (files.length + newApplication.attachments.length > MAX_FILE_COUNT) {
        setError(`Можно прикрепить не более ${MAX_FILE_COUNT} файлов`);
        return;
      }
      
      // Проверка типов файлов
      for (const file of files) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          setError(`Недопустимый формат файла: ${file.name}`);
          return;
        }
        
        if (file.size > MAX_FILE_SIZE) {
          setError(`Файл ${file.name} слишком большой (макс. 5MB)`);
          return;
        }
      }
      
      setNewApplication(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
      
      setError(null);
    }
  };

  // Удаление вложения
  const removeAttachment = (index: number) => {
    setNewApplication(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Отправка новой заявки (ИСПРАВЛЕННАЯ ВЕРСИЯ)
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!newApplication.type) {
      setError('Выберите тип заявки');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formData = new FormData();
      // Отправляем числовой ID типа заявки
      formData.append('type', newApplication.type);
      formData.append('description', newApplication.description);
      
      newApplication.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await api.post('applications/', formData);
      
      if (response.status === 201) {
        await fetchData();
        setNewApplication({ 
          type: '', 
          description: '', 
          attachments: [] 
        });
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Удаление заявки
  const deleteApplication = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    
    try {
      await api.delete(`applications/${id}/`);
      await fetchData();
    } catch (err) {
      handleError(err);
    }
  };

  // Рендер загрузки
  if (isLoading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  // Рендер ошибки
  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={fetchData} className="retry-btn">
          Повторить попытку
        </button>
      </div>
    );
  }

  // Рендер для администратора
  if (userData?.role === 'admin') {
    return <Adminstatements />;
  }

  // Основной рендер
  return (
    <div className="applications-section">
      {/* Фильтры */}
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по заявкам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все типы</option>
          {applicationTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все статусы</option>
          <option value="pending">На рассмотрении</option>
          <option value="approved">Одобрено</option>
          <option value="rejected">Отклонено</option>
        </select>
      </div>
      
      {/* Список заявок */}
      <div className="application-list">
        {applicationsData.results.length > 0 ? (
          <div className="table-responsive">
            <table className="applications-table">
              <thead>
                <tr>
                  <th className="col-expand"></th>
                  <th className="col-type">Тип заявки</th>
                  <th className="col-status">Статус</th>
                  <th className="col-date">Дата создания</th>
                  <th className="col-actions">Действия</th>
                </tr>
              </thead>
              <tbody>
                {applicationsData.results.map(app => (
                  <React.Fragment key={app.id}>
                    <tr className={`main-row ${expandedRows[app.id] ? 'expanded' : ''}`}>
                      <td className="col-expand">
                        <button 
                          onClick={() => toggleRowExpansion(app.id)}
                          className="expand-btn"
                          aria-label={expandedRows[app.id] ? "Свернуть" : "Развернуть"}
                        >
                          {expandedRows[app.id] ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      </td>
                      <td className="col-type">
                        <div className="cell-content">
                          {app.type_display}
                        </div>
                      </td>
                      <td className="col-status">
                        <span className={`status-badge ${app.status}`}>
                          {app.status_display}
                        </span>
                      </td>
                      <td className="col-date">
                        {new Date(app.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="col-actions">
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => deleteApplication(app.id)}
                            className="delete-btn"
                            title="Удалить"
                            aria-label="Удалить заявку"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRows[app.id] && (
                      <tr className="expanded-row">
                        <td colSpan={5}>
                          <div className="expanded-content">
                            <div className="expanded-section">
                              <h4>Описание</h4>
                              <p>{app.description || 'Нет описания'}</p>
                            </div>
                            
                            <div className="expanded-section">
                              <h4>Вложения</h4>
                              {app.attachments.length > 0 ? (
                                <div className="attachments-list">
                                  {app.attachments.map(attachment => (
                                    <a
                                      key={attachment.id}
                                      href={attachment.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="attachment-link"
                                    >
                                      <FaPaperclip /> {attachment.file.split('/').pop()?.split('?')[0]}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p>Нет вложений</p>
                              )}
                            </div>
                            
                            {app.admin_comment && (
                              <div className="expanded-section">
                                <h4>Комментарий администратора</h4>
                                <p>{app.admin_comment}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-applications">У вас нет заявок</p>
        )}
      </div>
      
      {/* Форма новой заявки */}
      <div className="new-application">
        <h3>Подать новую заявку</h3>
        <form onSubmit={handleApplicationSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="application-type">Тип заявки *</label>
            <select 
              id="application-type"
              value={newApplication.type}
              onChange={(e) => setNewApplication({
                ...newApplication, 
                type: e.target.value
              })}
              required
              className="form-control"
            >
              <option value="">Выберите тип заявки</option>
              {applicationTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="application-description">Описание *</label>
            <textarea 
              id="application-description"
              value={newApplication.description}
              onChange={(e) => setNewApplication({
                ...newApplication, 
                description: e.target.value
              })}
              placeholder="Опишите вашу заявку"
              required
              className="form-control"
              rows={5}
            />
          </div>
          
          <div className="form-group">
            <label>Вложения (макс. 5 файлов, 5MB каждый)</label>
            <div className="file-upload">
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={newApplication.attachments.length >= MAX_FILE_COUNT}
              >
                Выбрать файлы
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.zip,.rar"
                style={{ display: 'none' }}
                disabled={newApplication.attachments.length >= MAX_FILE_COUNT}
              />
              <span className="file-info">
                {newApplication.attachments.length} из {MAX_FILE_COUNT} файлов выбрано
              </span>
            </div>
            
            {newApplication.attachments.length > 0 && (
              <div className="attachments-preview">
                {newApplication.attachments.map((file, index) => (
                  <div key={`file-${index}`} className="attachment-item">
                    <span>{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="remove-attachment"
                      aria-label="Удалить файл"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  );
};