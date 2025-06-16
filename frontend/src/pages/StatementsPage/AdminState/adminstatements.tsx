import { useState, useEffect } from 'react';
import axios from 'axios';
import './adminstatements.css';
import { FaTrash, FaPaperclip, FaCheck, FaTimes, FaInbox, FaCheckCircle, FaBan, FaPlus } from 'react-icons/fa';
import { ApiEndpointHelper } from '../../../Context/AuthContext';
import { useAuth } from '../../../Context/AuthContext';

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  is_active: boolean;
  avatar: string | null;
};

type Attachment = {
  id: number;
  file: string;
  file_url: string;
  uploaded_at: string;
};

type ApplicationType = {
  id: number;
  name: string;
  code: string;
};

type Application = {
  id: number;
  user: User;
  type: ApplicationType;
  type_display: string;
  description: string;
  status: string;
  status_display: string;
  created_at: string;
  updated_at: string;
  admin_comment: string | null;
  attachments: Attachment[];
  status_logs: any[];
};

export const Adminstatements = () => {
  const { isAuthenticated, userData } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [adminComment, setAdminComment] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ApplicationType | null>(null);

  const getAuthConfig = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    return {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchData = async () => {
    if (!isAuthenticated || !ApiEndpointHelper.isAdmin(userData)) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [typesResponse, appsResponse] = await Promise.all([
        axios.get(ApiEndpointHelper.applicationtypes(), getAuthConfig()),
        axios.get(ApiEndpointHelper.applications(), getAuthConfig())
      ]);
      
      // Обработка типов заявлений
      const typesData = typesResponse.data.results || typesResponse.data;
      setApplicationTypes(Array.isArray(typesData) ? typesData : [typesData]);
      
      // Обработка заявлений
      const appsData = appsResponse.data.results || appsResponse.data;
      setApplications(Array.isArray(appsData) ? appsData : [appsData]);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error('Error details:', err);
    if (axios.isAxiosError(err)) {
      const serverError = err.response?.data;
      setError(
        serverError?.message || 
        serverError?.detail || 
        err.message || 
        'Ошибка сервера'
      );
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Неизвестная ошибка');
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await axios.patch(
        ApiEndpointHelper.getUrl(`/api/applications/${id}/`),
        { 
          status, 
          admin_comment: adminComment 
        },
        getAuthConfig()
      );
      await fetchData();
      setAdminComment('');
      setSelectedAppId(null);
    } catch (err) {
      handleError(err);
    }
  };

  const deleteApplication = async (id: number) => {
    try {
      await axios.delete(
        ApiEndpointHelper.getUrl(`/api/applications/${id}/`),
        getAuthConfig()
      );
      await fetchData();
    } catch (err) {
      handleError(err);
    }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim() || !newTypeCode.trim()) {
      setError('Название и код типа обязательны');
      return;
    }

    setIsAddingType(true);
    try {
      const response = await axios.post(
        ApiEndpointHelper.applicationtypes(),
        {
          name: newTypeName,
          code: newTypeCode
        },
        getAuthConfig()
      );
      
      if (response.data?.id) {
        setApplicationTypes(prev => [...prev, response.data]);
        setNewTypeName('');
        setNewTypeCode('');
        setShowAddTypeModal(false);
        setError(null);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsAddingType(false);
    }
  };

  const handleDeleteType = async () => {
    if (!typeToDelete) return;
    
    try {
      await axios.delete(
        ApiEndpointHelper.getUrl(`/api/application-types/${typeToDelete.id}/`),
        getAuthConfig()
      );
      
      setApplicationTypes(prev => prev.filter(type => type.id !== typeToDelete.id));
      
      if (typeFilter === typeToDelete.code) {
        setTypeFilter('');
      }
      
      setTypeToDelete(null);
    } catch (err) {
      handleError(err);
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications.filter(app => app.status === activeTab);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.user.username.toLowerCase().includes(query) ||
        app.user.first_name.toLowerCase().includes(query) ||
        app.user.last_name.toLowerCase().includes(query) ||
        app.user.email?.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(app => app.type.code === typeFilter);
    }
    
    return filtered;
  };

  const getStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  if (!isAuthenticated || !ApiEndpointHelper.isAdmin(userData)) {
    return <div className="error">Доступ запрещен. Требуются права администратора.</div>;
  }

  const filteredApplications = getFilteredApplications();
  const selectedTypeName = applicationTypes.find(t => t.code === typeFilter)?.name || typeFilter;

  return (
    <div className="admin-applications-container">
      {showAddTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Добавить новый тип заявления</h3>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Название типа:</label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Например: Академический отпуск"
              />
            </div>
            <div className="form-group">
              <label>Код типа:</label>
              <input
                type="text"
                value={newTypeCode}
                onChange={(e) => setNewTypeCode(e.target.value)}
                placeholder="Например: academic_leave"
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={handleAddType} 
                disabled={isAddingType}
                className="confirm-btn"
              >
                {isAddingType ? 'Создание...' : 'Создать'}
              </button>
              <button 
                onClick={() => {
                  setShowAddTypeModal(false);
                  setError(null);
                }}
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {typeToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Удалить тип заявления</h3>
            <p>Вы уверены, что хотите удалить тип "{typeToDelete.name}"? Все связанные заявления останутся, но их тип будет отображаться как "Неизвестный".</p>
            <div className="modal-actions">
              <button 
                onClick={handleDeleteType}
                className="confirm-btn danger"
              >
                Удалить
              </button>
              <button 
                onClick={() => setTypeToDelete(null)}
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-sidebar">
        <h2>Заявки</h2>
        <div 
          className={`sidebar-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FaInbox className="tab-icon" />
          <span>Входящие</span>
          <span className="tab-counter">{getStatusCount('pending')}</span>
        </div>
        <div 
          className={`sidebar-tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <FaCheckCircle className="tab-icon" />
          <span>Одобренные</span>
          <span className="tab-counter">{getStatusCount('approved')}</span>
        </div>
        <div 
          className={`sidebar-tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <FaBan className="tab-icon" />
          <span>Отклонённые</span>
          <span className="tab-counter">{getStatusCount('rejected')}</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-filters">
          <input
            type="text"
            placeholder="Поиск по заявкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="type-filter-container">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="type-filter"
            >
              <option value="">Все типы</option>
              {applicationTypes.map(type => (
                <option key={type.id} value={type.code}>{type.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowAddTypeModal(true)}
              className="add-type-btn"
            >
              <FaPlus /> Добавить тип
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Загрузка...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="applications-list">
            {filteredApplications.length > 0 ? (
              filteredApplications.map(app => (
                <div key={app.id} className="application-card">
                  <div className="card-header">
                    <div className="user-info">
                      <h3>{app.user.first_name} {app.user.last_name}</h3>
                      <p>{app.user.username} • {app.user.email}</p>
                    </div>
                    <div className="application-meta">
                      <span className={`status-badge ${app.status}`}>
                        {app.status_display}
                      </span>
                      <span className="application-date">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="application-type">{app.type_display}</div>
                    <p className="application-description">{app.description}</p>
                    
                    {app.attachments && app.attachments.length > 0 && (
                      <div className="attachments">
                        <h4>Вложения:</h4>
                        <div className="attachments-list">
                          {app.attachments.map(attachment => (
                            <a
                              key={attachment.id}
                              href={attachment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="attachment-link"
                            >
                              <FaPaperclip /> {attachment.file.split('/').pop()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.admin_comment && (
                      <div className="admin-comment">
                        <h4>{app.status === 'approved' ? 'Комментарий' : 'Причина отклонения'}:</h4>
                        <p>{app.admin_comment}</p>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'approved')}
                          className="action-btn approve-btn"
                        >
                          <FaCheck /> Одобрить
                        </button>
                        <button 
                          onClick={() => setSelectedAppId(app.id)}
                          className="action-btn reject-btn"
                        >
                          <FaTimes /> Отклонить
                        </button>
                      </>
                    )}
                    
                    {app.status === 'rejected' && (
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'approved')}
                        className="action-btn approve-btn"
                      >
                        <FaCheck /> Одобрить
                      </button>
                    )}

                    <button 
                      onClick={() => deleteApplication(app.id)}
                      className="action-btn delete-btn"
                    >
                      <FaTrash /> Удалить
                    </button>
                  </div>

                  {selectedAppId === app.id && (
                    <div className="comment-form">
                      <textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder="Укажите причину отклонения"
                        className="comment-textarea"
                        required
                      />
                      <div className="form-actions">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="confirm-btn"
                        >
                          Подтвердить отклонение
                        </button>
                        <button
                          onClick={() => setSelectedAppId(null)}
                          className="cancel-btn"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-applications">
                <p>
                  {typeFilter 
                    ? `Заявок типа "${selectedTypeName}" нет` 
                    : 'Нет заявок в этом разделе'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};